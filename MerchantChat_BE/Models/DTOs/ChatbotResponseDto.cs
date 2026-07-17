namespace MerchantChat_BE.Models.DTOs
{
    public class ChatbotResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ColorHex { get; set; } = string.Empty;
        public string WelcomeMessage { get; set; } = string.Empty;
    }
}