using MerchantChat_BE.Services;
using Supabase;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Configure Supabase
var supabaseUrl = builder.Configuration["Supabase:Url"];
var supabaseKey = builder.Configuration["Supabase:ServiceRoleKey"];
var options = new SupabaseOptions { AutoConnectRealtime = false };
builder.Services.AddSingleton(new Client(supabaseUrl, supabaseKey, options));

// Register Custom Services
builder.Services.AddSingleton<IEmbeddingService, EmbeddingService>();
builder.Services.AddSingleton<IGeminiAiService, GeminiAiService>();
builder.Services.AddTransient<IScraperService, ScraperService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<IChatbotService, ChatbotService>();
builder.Services.AddScoped<IKnowledgeBaseService, KnowledgeBaseService>();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "MerchantChat API v1");
    });
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();