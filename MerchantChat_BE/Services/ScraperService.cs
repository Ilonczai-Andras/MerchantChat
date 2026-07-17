using HtmlAgilityPack;
using System.Text.RegularExpressions;

namespace MerchantChat_BE.Services
{
    public interface IScraperService
    {
        Task<string> ScrapeUrlAsync(string url);
    }

    public class ScraperService : IScraperService
    {
        private readonly HttpClient _httpClient;

        public ScraperService()
        {
            _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
        }

        public async Task<string> ScrapeUrlAsync(string url)
        {
            var html = await _httpClient.GetStringAsync(url);
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            var nodesToRemove = doc.DocumentNode.SelectNodes("//script | //style | //noscript");
            if (nodesToRemove != null)
            {
                foreach (var node in nodesToRemove)
                {
                    node.Remove();
                }
            }

            var text = doc.DocumentNode.InnerText;

            text = Regex.Replace(text, @"\s+", " ").Trim();

            return text;
        }
    }
}