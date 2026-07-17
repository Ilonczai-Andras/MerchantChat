namespace MerchantChat_BE.Models.DTOs
{
    public class ProfileRequestDto
    {
        public Guid UserId { get; set; }
        public string Email { get; set; } = string.Empty;
    }
}