using MerchantChat_BE.Models.DTOs;
using MerchantChat_BE.Services;
using Microsoft.AspNetCore.Mvc;

namespace MyChatbotApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatbotsController : ControllerBase
    {
        private readonly IChatbotService _chatbotService;

        public ChatbotsController(IChatbotService chatbotService)
        {
            _chatbotService = chatbotService;
        }

        /// <summary>
        /// GET: api/chatbots/{botId}
        /// Fetches basic configuration properties for a specific bot client.
        /// </summary>
        [HttpGet("{botId}")]
        public async Task<IActionResult> GetChatbot([FromRoute] Guid botId)
        {
            if (botId == Guid.Empty)
            {
                return BadRequest(new { error = "Bot ID szükséges" });
            }

            try
            {
                var bot = await _chatbotService.GetChatbotByIdAsync(botId);

                if (bot == null)
                {
                    return NotFound(new { error = "Bot nem található" });
                }

                var botDto = new ChatbotResponseDto
                {
                    Id = bot.Id,
                    Name = bot.Name,
                    ColorHex = bot.ColorHex,
                    WelcomeMessage = bot.WelcomeMessage
                };

                return Ok(new { bot = botDto });
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error retrieving bot details: {ex.Message}");
                return StatusCode(500, new { error = "Hiba a lekérés során" });
            }
        }
    }
}