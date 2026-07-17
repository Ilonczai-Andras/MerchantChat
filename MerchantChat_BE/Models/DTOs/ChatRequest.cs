namespace MerchantChat_BE.Models.DTOs
{
    public class ChatRequest
    {
        public Guid ChatbotId { get; set; }
        public string UserMessage { get; set; }
        public string SessionId { get; set; }
    }
}