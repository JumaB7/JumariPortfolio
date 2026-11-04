using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
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

builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<PortfolioDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Portfolio")));
builder.Services.AddScoped<PortfolioContentService>();
builder.Services.AddScoped<FinancialContentService>();
builder.Services.AddScoped<AgentTools>();
builder.Services.AddScoped<AgentOrchestrator>();
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

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PortfolioDbContext>();
    db.Database.Migrate();
    PortfolioSeed.Apply(db);
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
app.UseStaticFiles();
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

app.MapFallbackToFile("index.html");

app.Run();
