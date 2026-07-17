namespace MerchantChat_BE.Models.DTOs
{
    public class KnowledgeBaseUploadDto
    {
        public Guid BotId { get; set; }
        public List<IFormFile>? Files { get; set; }
    }
}