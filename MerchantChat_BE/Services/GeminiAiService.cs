using System.Text;
using System.Text.Json;

namespace MerchantChat_BE.Services
{
    public interface IGeminiAiService
    {
        Task<string> GenerateContentAsync(string prompt);
    }

    public class GeminiAiService : IGeminiAiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public GeminiAiService(IConfiguration config)
        {
            _httpClient = new HttpClient();
            _apiKey = config["Google:ApiKey"] ?? throw new ArgumentNullException("Google API Key is missing");
        }

        public async Task<string> GenerateContentAsync(string prompt)
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_apiKey}";

            var requestBody = new
            {
                contents = new[]
                {
                    new { role = "user", parts = new[] { new { text = prompt } } }
                },
                generationConfig = new { temperature = 0.2 }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(url, content);
            response.EnsureSuccessStatusCode();

            var responseString = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseString);

            var textResult = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return textResult ?? string.Empty;
        }
    }
}