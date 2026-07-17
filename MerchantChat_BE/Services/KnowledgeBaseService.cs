using MerchantChat_BE.Services;
using MyChatbotApi.Models.Entities;
using System.Text;

namespace MerchantChat_BE.Services
{
    public interface IKnowledgeBaseService
    {
        Task<int> ProcessFilesAsync(Guid botId, List<IFormFile> files);
    }

    public class KnowledgeBaseService : IKnowledgeBaseService
    {
        private readonly Supabase.Client _supabase;
        private readonly IEmbeddingService _embeddingService;

        public KnowledgeBaseService(Supabase.Client supabase, IEmbeddingService embeddingService)
        {
            _supabase = supabase;
            _embeddingService = embeddingService;
        }

        public async Task<int> ProcessFilesAsync(Guid botId, List<IFormFile> files)
        {
            var combinedTextBuilder = new StringBuilder();

            foreach (var file in files)
            {
                if (file.Length == 0) continue;

                string fileContent = string.Empty;
                var fileName = file.FileName.ToLower();

                if (fileName.EndsWith(".txt"))
                {
                    fileContent = await ParseTXTAsync(file);
                }
                else if (fileName.EndsWith(".csv"))
                {
                    fileContent = await ParseCSVAsync(file);
                }
                else if (fileName.EndsWith(".pdf"))
                {
                    throw new NotSupportedException("PDF feldolgozás jelenleg nem támogatott. Kérjük konvertáld TXT vagy CSV formátumra.");
                }
                else
                {
                    Console.WriteLine($"Ismeretlen fájltípus kihagyva: {file.FileName}");
                    continue;
                }

                combinedTextBuilder.Append(fileContent).Append("\n\n---\n\n");
            }

            var combinedText = combinedTextBuilder.ToString();

            if (string.IsNullOrWhiteSpace(combinedText))
            {
                throw new Exception("Nincsenek feldolgozható szövegek a fájlokból");
            }

            var chunks = new List<string>();
            var chunkSize = 1000;
            for (int i = 0; i < combinedText.Length; i += chunkSize)
            {
                var length = Math.Min(chunkSize, combinedText.Length - i);
                chunks.Add(combinedText.Substring(i, length));
            }

            var insertData = new List<KnowledgeBase>();
            foreach (var chunk in chunks)
            {
                var embedding = await _embeddingService.GetEmbeddingAsync(chunk);
                insertData.Add(new KnowledgeBase
                {
                    Id = Guid.NewGuid(),
                    ChatbotId = botId,
                    Content = chunk,
                    Embedding = embedding,
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _supabase.From<KnowledgeBase>().Insert(insertData);

            return chunks.Count;
        }

        private async Task<string> ParseTXTAsync(IFormFile file)
        {
            using var reader = new StreamReader(file.OpenReadStream(), Encoding.UTF8);
            return await reader.ReadToEndAsync();
        }

        private async Task<string> ParseCSVAsync(IFormFile file)
        {
            using var reader = new StreamReader(file.OpenReadStream(), Encoding.UTF8);
            var content = await reader.ReadToEndAsync();

            var lines = content.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);
            var parsedRows = lines.Select(line =>
            {
                var cells = line.Split(',').Select(cell => cell.Trim());
                return string.Join(" ", cells);
            });

            return string.Join("\n", parsedRows);
        }
    }
}