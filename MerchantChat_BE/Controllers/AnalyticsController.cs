using MerchantChat_BE.Models.DTOs;
using MerchantChat_BE.Services;
using Microsoft.AspNetCore.Mvc;

namespace MyChatbotApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;

        public AnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        /// <summary>
        /// GET: api/analytics?botId=uuid&days=30
        /// Fetches all metric analytics for a specific chatbot.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetStats([FromQuery] Guid botId, [FromQuery] int days = 30)
        {
            if (botId == Guid.Empty)
            {
                return BadRequest(new { error = "botId szükséges" });
            }

            try
            {
                var stats = await _analyticsService.GetStatsAsync(botId, days);
                return Ok(new { success = true, stats });
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex);
                return StatusCode(500, new { error = "Hiba a statisztikák lekérésekor", details = ex.Message });
            }
        }

        /// <summary>
        /// POST: api/analytics
        /// Updates the user feedback rating on a past AI response.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> SaveRating([FromBody] RatingUpdateRequest req)
        {
            if (req.ChatbotId == Guid.Empty)
            {
                return BadRequest(new { error = "chatbotId és userRating szükséges" });
            }

            try
            {
                var success = await _analyticsService.SaveRatingAsync(req.ChatbotId, req.UserRating, req.AnalyticsId);
                if (!success)
                {
                    return NotFound(new { error = "Nincs analytics adat" });
                }

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex);
                return StatusCode(500, new { error = "Hiba a rating mentésekor", details = ex.Message });
            }
        }
    }
}