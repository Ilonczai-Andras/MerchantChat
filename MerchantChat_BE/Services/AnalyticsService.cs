using MyChatbotApi.Models.Entities;
using Supabase;

namespace MerchantChat_BE.Services
{
    public interface IAnalyticsService
    {
        Task<object> GetStatsAsync(Guid botId, int days);
        Task<bool> SaveRatingAsync(Guid chatbotId, int userRating, Guid? analyticsId);
    }

    public class AnalyticsService : IAnalyticsService
    {
        private readonly Supabase.Client _supabase;

        public AnalyticsService(Supabase.Client supabase)
        {
            _supabase = supabase;
        }

        public async Task<object> GetStatsAsync(Guid botId, int days)
        {
            var startDate = DateTime.UtcNow.AddDays(-days);

            // Fetch analytics steps
            var response = await _supabase.From<Analytics>()
                .Where(a => a.ChatbotId == botId)
                .Where(a => a.CreatedAt >= startDate)
                .Order(a => a.CreatedAt, Supabase.Postgrest.Constants.Ordering.Descending)
                .Get();

            var allAnalytics = response.Models ?? new List<Analytics>();

            // Calculate basic stats
            var totalQuestions = allAnalytics.Count;
            var avgResponseTime = totalQuestions > 0
                ? Math.Round(allAnalytics.Average(a => a.ResponseTimeMs))
                : 0;

            // Top questions (frequency-based)
            var topQuestions = allAnalytics
                .Where(a => !string.IsNullOrEmpty(a.UserQuestion))
                .GroupBy(a => a.UserQuestion)
                .OrderByDescending(g => g.Count())
                .Take(10)
                .Select(g => new { question = g.Key, count = g.Count() })
                .ToList();

            // Rating calculations
            var ratings = allAnalytics.Where(a => a.UserRating != null && a.UserRating != 0).ToList();
            var upvotes = ratings.Count(a => a.UserRating == 1);
            var downvotes = ratings.Count(a => a.UserRating == -1);
            var satisfactionRate = ratings.Count > 0
                ? Math.Round(((double)upvotes / ratings.Count) * 100)
                : 0;

            // Hourly distribution (Local timezone mapping)
            var hourlyStats = new Dictionary<int, int>();
            foreach (var a in allAnalytics)
            {
                var localHour = a.CreatedAt.ToLocalTime().Hour;
                if (!hourlyStats.ContainsKey(localHour))
                {
                    hourlyStats[localHour] = 0;
                }
                hourlyStats[localHour]++;
            }

            var hourlyData = Enumerable.Range(0, 24).Select(hour => new
            {
                hour,
                count = hourlyStats.ContainsKey(hour) ? hourlyStats[hour] : 0
            }).ToList();

            return new
            {
                totalQuestions,
                avgResponseTime,
                topQuestions,
                satisfaction = new
                {
                    upvotes,
                    downvotes,
                    satisfactionRate,
                    totalRatings = ratings.Count
                },
                hourlyData
            };
        }

        public async Task<bool> SaveRatingAsync(Guid chatbotId, int userRating, Guid? analyticsId)
        {
            if (!analyticsId.HasValue || analyticsId.Value == Guid.Empty)
            {
                return false;
            }

            try
            {
                var response = await _supabase.From<Analytics>()
                    .Where(a => a.Id == analyticsId.Value)
                    .Single();

                if (response == null)
                {
                    return false;
                }

                response.UserRating = userRating;

                await _supabase.From<Analytics>().Update(response);

                return true;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error updating rating for analytics entry {analyticsId.Value}: {ex.Message}");
                return false;
            }
        }
    }
}