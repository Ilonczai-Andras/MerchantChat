namespace MerchantChat_BE.Models.DTOs
{
    public class RatingUpdateRequest
    {
        public Guid ChatbotId { get; set; }
        public int UserRating { get; set; }
        public Guid? AnalyticsId { get; set; }
    }
}
