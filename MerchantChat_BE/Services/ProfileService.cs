using MyChatbotApi.Models.Entities;

namespace MerchantChat_BE.Services
{
    public interface IProfileService
    {
        /// <summary>
        /// Checks if a profile exists. If not, inserts a new default free profile.
        /// </summary>
        /// <returns>A tuple indicating if the profile was created, alongside the profile data.</returns>
        Task<(bool Created, Profile Profile)> ProvisionProfileAsync(Guid userId);
    }

    public class ProfileService : IProfileService
    {
        private readonly Supabase.Client _supabase;

        public ProfileService(Supabase.Client supabase)
        {
            _supabase = supabase;
        }

        public async Task<(bool Created, Profile Profile)> ProvisionProfileAsync(Guid userId)
        {
            var existingResponse = await _supabase.From<Profile>()
                .Where(p => p.Id == userId)
                .Get();

            var existingProfile = existingResponse.Models.FirstOrDefault();

            if (existingProfile != null)
            {
                return (Created: false, Profile: existingProfile);
            }

            var newProfile = new Profile
            {
                Id = userId,
                CompanyName = "My Company",
                SubscriptionStatus = "free"
            };

            var insertResponse = await _supabase.From<Profile>().Insert(newProfile);
            var createdProfile = insertResponse.Models.FirstOrDefault();

            if (createdProfile == null)
            {
                throw new Exception("Nem sikerült létrehozni a profilt a Supabase-ben.");
            }

            return (Created: true, Profile: createdProfile);
        }
    }
}