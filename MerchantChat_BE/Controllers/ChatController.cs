using MerchantChat_BE.Models.DTOs;
using MerchantChat_BE.Services;
using Microsoft.AspNetCore.Mvc;
using MyChatbotApi.Models.Entities;
using System.Diagnostics;
using System.Text.Json;

namespace MyChatbotApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly Supabase.Client _supabase;
        private readonly IEmbeddingService _embeddingService;
        private readonly IGeminiAiService _geminiService;

        public ChatController(Supabase.Client supabase, IEmbeddingService embeddingService, IGeminiAiService geminiService)
        {
            _supabase = supabase;
            _embeddingService = embeddingService;
            _geminiService = geminiService;
        }

        /// <summary>
        /// GET: api/chat/bot-logs?botId=uuid
        /// Retrieves all raw chat logs for a specific chatbot, ordered descending by creation date.
        /// </summary>
        [HttpGet("bots/{botId}/logs")]
        public async Task<IActionResult> GetBotLogs([FromRoute] Guid botId)
        {
            if (botId == Guid.Empty)
            {
                return BadRequest(new { error = "botId szükséges" });
            }

            try
            {
                var logsResponse = await _supabase.From<ChatLog>()
                    .Where(l => l.ChatbotId == botId)
                    .Order(l => l.CreatedAt, Supabase.Postgrest.Constants.Ordering.Descending)
                    .Get();

                return Ok(new { logs = logsResponse.Models ?? new List<ChatLog>() });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Hiba a lekérés során", details = ex.Message });
            }
        }

        /// <summary>
        /// GET: api/chat/logs?sessionId=xyz&botId=uuid
        /// Retrieves and enriches chat logs with ratings/analytics for a specific session.
        /// </summary>
        [HttpGet("sessions/{sessionId}")]
        public async Task<IActionResult> GetSessionLogs([FromRoute] string sessionId, [FromQuery] Guid botId)
        {
            if (string.IsNullOrEmpty(sessionId) || botId == Guid.Empty)
            {
                return BadRequest(new { error = "sessionId és botId szükséges" });
            }

            try
            {
                var logsResponse = await _supabase.From<ChatLog>()
                    .Where(l => l.SessionId == sessionId)
                    .Where(l => l.ChatbotId == botId)
                    .Order(l => l.CreatedAt, Supabase.Postgrest.Constants.Ordering.Ascending)
                    .Get();

                var logs = logsResponse.Models;

                var analyticsResponse = await _supabase.From<Analytics>()
                    .Where(a => a.SessionId == sessionId)
                    .Where(a => a.ChatbotId == botId)
                    .Order(a => a.CreatedAt, Supabase.Postgrest.Constants.Ordering.Ascending)
                    .Get();

                var analyticsList = analyticsResponse.Models;

                var enrichedLogs = logs.Select((log, index) =>
                {
                    var correspondingAnalytics = index < analyticsList.Count ? analyticsList[index] : null;

                    return new
                    {
                        id = log.Id,
                        chatbot_id = log.ChatbotId,
                        session_id = log.SessionId,
                        user_message = log.UserMessage,
                        bot_response = log.BotResponse,
                        created_at = log.CreatedAt,
                        analytics_id = correspondingAnalytics?.Id ?? null,
                        analytics_rating = correspondingAnalytics?.UserRating ?? null
                    };
                }).ToList();

                return Ok(new { logs = enrichedLogs });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Hiba a lekérés során", details = ex.Message });
            }
        }

        /// <summary>
        /// DELETE: api/chat/log?id=uuid
        /// Deletes a specific chat log by its unique database ID.
        /// </summary>
        [HttpDelete("log")]
        public async Task<IActionResult> DeleteLog([FromQuery] Guid id)
        {
            if (id == Guid.Empty)
            {
                return BadRequest(new { error = "id szükséges" });
            }

            try
            {
                await _supabase.From<ChatLog>()
                    .Where(l => l.Id == id)
                    .Delete();

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Törlés sikertelen", details = ex.Message });
            }
        }

        /// <summary>
        /// POST: api/chat
        /// Processes chat prompts, vectors, LLM context generation, and saves the history.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Chat([FromBody] ChatRequest req)
        {
            var stopwatch = Stopwatch.StartNew();

            try
            {
                var queryEmbedding = await _embeddingService.GetEmbeddingAsync(req.UserMessage);

                var rpcParams = new Dictionary<string, object>
                {
                    { "query_embedding", queryEmbedding },
                    { "match_threshold", 0.3 },
                    { "match_count", 5 },
                    { "p_chatbot_id", req.ChatbotId }
                };

                var rpcResponse = await _supabase.Rpc("match_knowledge", rpcParams);
                string contextText = ParseRpcToContext(rpcResponse.Content);

                var userPrompt = $@"Te egy udvarias, segítőkész magyar nyelvű ügyfélszolgálati AI chatbot vagy.

                        Az alábbi TUDÁSBÁZIS tartalmazza az összes információt, amit tudnod kell:

                        < TUDASBAZIS >
                        ${contextText}
                        </ TUDASBAZIS >

                        FONTOS SZABÁLYOK:
                            1.Kizárólag a TUDÁSBÁZIS alapján válaszolj
                            2.Ha a válasz nincs benne a TUDÁSBÁZISBAN, mondd el udvariasan, hogy nem tudod a választ
                            3.Javasold, hogy vegyék fel a kapcsolatot az ügyfélszolgálattal, ha nincs információ
                            4.NE találj ki információkat!
                            5.Válaszolj mindig magyarul!
                        Vásárló kérdése: ${req.UserMessage}";

                var botReply = await _geminiService.GenerateContentAsync(userPrompt);
                stopwatch.Stop();

                var sessionId = string.IsNullOrEmpty(req.SessionId) ? $"session_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}" : req.SessionId;

                var log = new ChatLog
                {
                    ChatbotId = req.ChatbotId,
                    SessionId = sessionId,
                    UserMessage = req.UserMessage,
                    BotResponse = botReply,
                    CreatedAt = DateTime.UtcNow
                };
                await _supabase.From<ChatLog>().Insert(log);

                var analytics = new Analytics
                {
                    ChatbotId = req.ChatbotId,
                    SessionId = sessionId,
                    UserQuestion = req.UserMessage,
                    BotResponse = botReply,
                    ResponseTimeMs = (int)stopwatch.ElapsedMilliseconds,
                    CreatedAt = DateTime.UtcNow
                };
                var insertedAnalytics = await _supabase.From<Analytics>().Insert(analytics);
                var analyticsId = insertedAnalytics.Models.FirstOrDefault()?.Id;

                return Ok(new { reply = botReply, analyticsId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Hiba a feldolgozás során", details = ex.Message });
            }
        }
    private string ParseRpcToContext(string rpcContent)
    {
        if (string.IsNullOrWhiteSpace(rpcContent))
        {
            return "Nincs találat a tudásbázisban.";
        }

        try
        {
            using var doc = JsonDocument.Parse(rpcContent);

            if (doc.RootElement.ValueKind != JsonValueKind.Array)
            {
                return "Nincs találat a tudásbázisban.";
            }

            var contents = doc.RootElement.EnumerateArray()
                .Select(element => element.GetProperty("content").GetString())
                .Where(content => !string.IsNullOrEmpty(content))
                .ToList();

            if (!contents.Any())
            {
                return "Nincs találat a tudásbázisban.";
            }

            return string.Join("\n\n---\n\n", contents);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error parsing RPC JSON: {ex.Message}");
            return "Hiba a tudásbázis adatok feldolgozásakor.";
        }
    }
    }
}