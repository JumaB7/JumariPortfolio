using System.IO.Compression;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Net.Http.Headers;
using PortfolioAPI.Agent;
using PortfolioAPI.Data;
using PortfolioAPI.RateLimiting;
using PortfolioAPI.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    // Azure App Service terminates TLS and forwards the client IP.
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat([
        "application/javascript",
        "application/json",
        "image/svg+xml",
        "application/xml",
        "text/plain",
    ]);
});
builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Fastest;
});
builder.Services.Configure<GzipCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Fastest;
});
builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<PortfolioDbContext>(options =>
    options.UseSqlServer(
        ResumeAwareConnectionString(builder.Configuration.GetConnectionString("Portfolio")),
        sql =>
        {
            // Error -2 is the post-login timeout seen when serverless SQL is resuming.
            // Retries still fail the request if the database stays unavailable.
            sql.EnableRetryOnFailure(
                maxRetryCount: 3,
                maxRetryDelay: TimeSpan.FromSeconds(8),
                errorNumbersToAdd: null);
            sql.CommandTimeout(30);
        }));
builder.Services.AddMemoryCache();
builder.Services.Configure<DashboardOverviewCacheOptions>(_ => { });
builder.Services.AddSingleton<DashboardOverviewCacheGate>();
builder.Services.AddScoped<PortfolioContentService>();
builder.Services.AddScoped<IPortfolioContentService>(sp => sp.GetRequiredService<PortfolioContentService>());
builder.Services.AddScoped<IDashboardOverviewService, DashboardOverviewService>();
builder.Services.AddScoped<FinancialContentService>();
builder.Services.AddScoped<AgentTools>();
builder.Services.AddScoped<AgentOrchestrator>();
builder.Services.Configure<ContactEmailOptions>(
    builder.Configuration.GetSection(ContactEmailOptions.SectionName));
builder.Services.AddHttpClient<IContactEmailService, ResendContactEmailService>(client =>
{
    client.BaseAddress = new Uri("https://api.resend.com/");
    client.Timeout = TimeSpan.FromSeconds(30);
});
builder.Services.AddPortfolioRateLimiting(builder.Configuration);

var corsOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
    ?? ["http://localhost:4200", "http://localhost:4300"];
builder.Services.AddCors(options =>
{
    options.AddPolicy("PortfolioWebApp", policy =>
        policy.WithOrigins(corsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();
app.UseForwardedHeaders();
app.UseResponseCompression();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PortfolioDbContext>();
    db.Database.Migrate();
    PortfolioSeed.Apply(db);
    // Seed upserts project catalogue on startup — drop any stale overview.
    scope.ServiceProvider.GetRequiredService<IDashboardOverviewService>().Invalidate();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler();
    app.UseHttpsRedirection();
}

app.UseStatusCodePages();
app.UseDefaultFiles();

var contentTypes = new FileExtensionContentTypeProvider();
contentTypes.Mappings[".xml"] = "application/xml";
contentTypes.Mappings[".txt"] = "text/plain";
contentTypes.Mappings[".webp"] = "image/webp";
contentTypes.Mappings[".webm"] = "video/webm";
void SetStaticCacheHeaders(StaticFileResponseContext ctx)
{
    var path = ctx.File.Name;
    var requestPath = ctx.Context.Request.Path.Value ?? string.Empty;
    var headers = ctx.Context.Response.Headers;

    // Fingerprinted Angular bundles — long cache, immutable.
    if (path.Contains('-') && (path.EndsWith(".js", StringComparison.OrdinalIgnoreCase)
        || path.EndsWith(".css", StringComparison.OrdinalIgnoreCase)))
    {
        headers[HeaderNames.CacheControl] = "public,max-age=31536000,immutable";
        return;
    }

    // Media and icons — long cache; filenames are stable and versioned by deploy.
    if (path.EndsWith(".webp", StringComparison.OrdinalIgnoreCase)
        || path.EndsWith(".png", StringComparison.OrdinalIgnoreCase)
        || path.EndsWith(".jpg", StringComparison.OrdinalIgnoreCase)
        || path.EndsWith(".jpeg", StringComparison.OrdinalIgnoreCase)
        || path.EndsWith(".ico", StringComparison.OrdinalIgnoreCase)
        || path.EndsWith(".webm", StringComparison.OrdinalIgnoreCase)
        || path.EndsWith(".woff2", StringComparison.OrdinalIgnoreCase))
    {
        headers[HeaderNames.CacheControl] = "public,max-age=604800,stale-while-revalidate=86400";
        return;
    }

    // HTML shell (including `/` via default files / SPA fallback) and SEO text — always revalidate.
    if (path.Equals("index.html", StringComparison.OrdinalIgnoreCase)
        || path.EndsWith(".html", StringComparison.OrdinalIgnoreCase)
        || requestPath is "/" or "/index.html"
        || path.Equals("robots.txt", StringComparison.OrdinalIgnoreCase)
        || path.Equals("sitemap.xml", StringComparison.OrdinalIgnoreCase))
    {
        headers[HeaderNames.CacheControl] = "no-cache";
    }
}

var staticFileOptions = new StaticFileOptions
{
    ContentTypeProvider = contentTypes,
    OnPrepareResponse = SetStaticCacheHeaders,
};
app.UseStaticFiles(staticFileOptions);
app.UseCors("PortfolioWebApp");
app.UseRateLimiter();
app.UseAuthorization();
app.MapControllers();

// Unknown /api/* paths must not fall through to the SPA index.html.
app.MapFallback("/api/{**path}", async context =>
{
    context.Response.StatusCode = StatusCodes.Status404NotFound;
    await context.Response.WriteAsJsonAsync(new
    {
        title = "Not Found",
        status = 404,
        detail = "No API endpoint matches this path.",
    });
});

// SPA deep links — same no-cache policy as index.html.
app.MapFallbackToFile("index.html", staticFileOptions);

app.Run();

static string? ResumeAwareConnectionString(string? connectionString)
{
    if (string.IsNullOrWhiteSpace(connectionString))
        return connectionString;

    var connection = new SqlConnectionStringBuilder(connectionString);
    // Default 15s expires while Azure SQL serverless is still in post-login resume.
    if (connection.ConnectTimeout < 60)
        connection.ConnectTimeout = 60;
    return connection.ConnectionString;
}
