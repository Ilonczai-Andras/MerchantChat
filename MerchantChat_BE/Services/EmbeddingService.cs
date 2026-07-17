using ElBruno.LocalEmbeddings;
using ElBruno.LocalEmbeddings.Options;

namespace MerchantChat_BE.Services
{
    public interface IEmbeddingService
    {
        Task<List<float>> GetEmbeddingAsync(string text);
    }

    public class EmbeddingService : IEmbeddingService, IDisposable
    {
        private readonly LocalEmbeddingGenerator _generator;

        public EmbeddingService()
        {
            _generator = new LocalEmbeddingGenerator(new LocalEmbeddingsOptions());
        }

        public async Task<List<float>> GetEmbeddingAsync(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
            {
                return new List<float>();
            }

            var result = await _generator.GenerateEmbeddingAsync(text);

            return result.Vector.ToArray().ToList();
        }

        public void Dispose()
        {
            _generator?.Dispose();
        }
    }
}