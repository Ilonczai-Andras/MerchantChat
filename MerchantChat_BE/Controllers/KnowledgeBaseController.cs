using HtmlAgilityPack;
using MerchantChat_BE.Models.DTOs;
using MerchantChat_BE.Services;
using Microsoft.AspNetCore.Mvc;
using MyChatbotApi.Models.Entities;
using Supabase;
using System.Xml;

namespace MyChatbotApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class KnowledgeBaseController : ControllerBase
    {
        private readonly Client _supabase;
        private readonly IEmbeddingService _embeddingService;
        private readonly IKnowledgeBaseService _knowledgeBaseService;

        public KnowledgeBaseController(Client supabase, IEmbeddingService embeddingService)
        {
            _supabase = supabase;
            _embeddingService = embeddingService;

        }

        [HttpPost("url")]
        public async Task<IActionResult> ScrapeUrl([FromBody] ScrapeRequest req)
        {
            if (req.BotId == Guid.Empty || string.IsNullOrEmpty(req.Url))
                return BadRequest(new { error = "botId és url szükségesek" });

            try
            {
                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0");

                var html = await httpClient.GetStringAsync(req.Url);
                var doc = new HtmlDocument();
                doc.LoadHtml(html);

                doc.DocumentNode.Descendants()
                    .Where(n => n.Name == "script" || n.Name == "style" || n.Name == "noscript")
                    .ToList()
                    .ForEach(n => n.Remove());

                var text = doc.DocumentNode.InnerText;
                text = System.Text.RegularExpressions.Regex.Replace(text, @"\s+", " ").Trim();

                if (string.IsNullOrWhiteSpace(text))
                    return BadRequest(new { error = "Nincsenek feldolgozható szövegek az URL-ből" });

                var chunks = Enumerable.Range(0, text.Length / 1000 + 1)
                                       .Select(i => text.Substring(i * 1000, Math.Min(1000, text.Length - i * 1000)))
                                       .Where(c => !string.IsNullOrWhiteSpace(c))
                                       .ToList();

                var insertData = new List<KnowledgeBase>();
                foreach (var chunk in chunks)
                {
                    var embedding = await _embeddingService.GetEmbeddingAsync(chunk);
                    insertData.Add(new KnowledgeBase
                    {
                        ChatbotId = req.BotId,
                        Content = chunk,
                        Embedding = embedding,
                        CreatedAt = DateTime.UtcNow
                    });
                }

                await _supabase.From<KnowledgeBase>().Insert(insertData);

                return Ok(new { success = true, message = $"✅ URL feldolgozva, {chunks.Count} új chunk hozzáadva" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"URL leszedés sikertelen: {ex.Message}" });
            }
        }

        /// <summary>
        /// POST: api/knowledgebase/upload
        /// Uploads TXT and CSV files, extracts text, chunks it, embeds it, and saves to database.
        /// </summary>
        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadFiles([FromForm] KnowledgeBaseUploadDto dto)
        {
            if (dto.BotId == Guid.Empty || dto.Files == null || dto.Files.Count == 0)
            {
                return BadRequest(new { error = "botId és fájlok szükségesek" });
            }

            try
            {
                var chunkCount = await _knowledgeBaseService.ProcessFilesAsync(dto.BotId, dto.Files);

                return Ok(new
                {
                    success = true,
                    message = $"✅ {dto.Files.Count} fájl feldolgozva, {chunkCount} új chunk hozzáadva"
                });
            }
            catch (NotSupportedException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Upload hiba: {ex}");
                return StatusCode(500, new { error = "Hiba a feltöltéskor", details = ex.Message });
            }
        }
    }

    public class ScrapeRequest
    {
        public Guid BotId { get; set; }
        public string Url { get; set; }
    }
}