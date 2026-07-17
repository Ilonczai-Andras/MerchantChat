using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace MyChatbotApi.Models.Entities
{
    [Table("chat_logs")]
    public class ChatLog : BaseModel
    {
        [PrimaryKey("id", false)] public Guid Id { get; set; }
        [Column("chatbot_id")] public Guid ChatbotId { get; set; }
        [Column("session_id")] public string SessionId { get; set; }
        [Column("user_message")] public string UserMessage { get; set; }
        [Column("bot_response")] public string BotResponse { get; set; }
        [Column("created_at")] public DateTime CreatedAt { get; set; }
    }

    [Table("analytics")]
    public class Analytics : BaseModel
    {
        [PrimaryKey("id", false)] public Guid Id { get; set; }
        [Column("chatbot_id")] public Guid ChatbotId { get; set; }
        [Column("user_question")] public string UserQuestion { get; set; }
        [Column("bot_response")] public string BotResponse { get; set; }
        [Column("response_time_ms")] public int ResponseTimeMs { get; set; }
        [Column("user_rating")] public int? UserRating { get; set; }
        [Column("session_id")] public string SessionId { get; set; }
        [Column("created_at")] public DateTime CreatedAt { get; set; }
    }

    [Table("knowledge_base")]
    public class KnowledgeBase : BaseModel
    {
        [PrimaryKey("id", false)] public Guid Id { get; set; }
        [Column("chatbot_id")] public Guid ChatbotId { get; set; }
        [Column("content")] public string Content { get; set; }
        [Column("embedding")] public List<float> Embedding { get; set; }
        [Column("created_at")] public DateTime CreatedAt { get; set; }
    }

    [Table("profiles")]
    public class Profile : BaseModel
    {
        [PrimaryKey("id", false)] public Guid Id { get; set; }
        [Column("company_name")] public string CompanyName { get; set; }
        [Column("subscription_status")] public string SubscriptionStatus { get; set; }
    }

    [Table("chatbots")]
    public class Chatbot : BaseModel
    {
        [PrimaryKey("id", false)] public Guid Id { get; set; }
        [Column("user_id")] public Guid UserId { get; set; }
        [Column("name")] public string Name { get; set; } = string.Empty;
        [Column("color_hex")] public string ColorHex { get; set; } = string.Empty;
        [Column("welcome_message")] public string WelcomeMessage { get; set; } = string.Empty;
        [Column("created_at")] public DateTime CreatedAt { get; set; }
        [Column("updated_at")] public DateTime UpdatedAt { get; set; }
    }
}