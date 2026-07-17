using MerchantChat_BE.Models.DTOs;
using MerchantChat_BE.Services;
using Microsoft.AspNetCore.Mvc;

namespace MyChatbotApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfilesController : ControllerBase
    {
        private readonly IProfileService _profileService;

        public ProfilesController(IProfileService profileService)
        {
            _profileService = profileService;
        }

        /// <summary>
        /// POST: api/profiles
        /// Provision or retrieve a user profile on login/sign-up.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> ProvisionProfile([FromBody] ProfileRequestDto request)
        {
            if (request.UserId == Guid.Empty || string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new { error = "User ID and email are required" });
            }

            try
            {
                var (created, profile) = await _profileService.ProvisionProfileAsync(request.UserId);

                return Ok(new
                {
                    created,
                    profile = new
                    {
                        id = profile.Id,
                        company_name = profile.CompanyName,
                        subscription_status = profile.SubscriptionStatus
                    }
                });
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"API error: {ex}");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}