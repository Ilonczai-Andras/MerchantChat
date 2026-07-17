using MyChatbotApi.Models.Entities;

namespace MerchantChat_BE.Services
{
    public interface IChatbotService
    {
        /// <summary>
        /// Retrieves core configuration details for a specific chatbot.
        /// </summary>
        Task<Chatbot?> GetChatbotByIdAsync(Guid botId);
    }

    public class ChatbotService : IChatbotService
    {
        private readonly Supabase.Client _supabase;

        public ChatbotService(Supabase.Client supabase)
        {
            _supabase = supabase;
        }

        public async Task<Chatbot?> GetChatbotByIdAsync(Guid botId)
        {
            try
            {
                var response = await _supabase.From<Chatbot>()
                    .Where(c => c.Id == botId)
                    .Single();

                return response;
            }
            catch (Exception)
            {
                return null;
            }
        }
    }
}