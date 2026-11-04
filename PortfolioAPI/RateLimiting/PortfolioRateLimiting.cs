using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

namespace PortfolioAPI.RateLimiting;

public static class PortfolioRateLimiting
{
    public const string Contact = "contact";
    public const string Agent = "agent";
    public const string ApiRead = "api-read";

    public static IServiceCollection AddPortfolioRateLimiting(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var contactPermit = configuration.GetValue("RateLimiting:Contact:PermitLimit", 5);
        var contactWindowMinutes = configuration.GetValue("RateLimiting:Contact:WindowMinutes", 10);
        var agentPermit = configuration.GetValue("RateLimiting:Agent:PermitLimit", 20);
        var agentWindowSeconds = configuration.GetValue("RateLimiting:Agent:WindowSeconds", 60);
        var readPermit = configuration.GetValue("RateLimiting:ApiRead:PermitLimit", 120);
        var readWindowSeconds = configuration.GetValue("RateLimiting:ApiRead:WindowSeconds", 60);

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.OnRejected = async (context, cancellationToken) =>
            {
                if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                {
                    context.HttpContext.Response.Headers.RetryAfter =
                        ((int)retryAfter.TotalSeconds).ToString();
                }

                context.HttpContext.Response.ContentType = "application/json";
                await context.HttpContext.Response.WriteAsJsonAsync(
                    new
                    {
                        title = "Too Many Requests",
                        status = StatusCodes.Status429TooManyRequests,
                        detail = "Rate limit exceeded. Please try again later.",
                    },
                    cancellationToken);
            };

            options.AddPolicy(Contact, httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    GetClientKey(httpContext),
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = contactPermit,
                        Window = TimeSpan.FromMinutes(contactWindowMinutes),
                        QueueLimit = 0,
                        AutoReplenishment = true,
                    }));

            options.AddPolicy(Agent, httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    GetClientKey(httpContext),
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = agentPermit,
                        Window = TimeSpan.FromSeconds(agentWindowSeconds),
                        QueueLimit = 0,
                        AutoReplenishment = true,
                    }));

            options.AddPolicy(ApiRead, httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    GetClientKey(httpContext),
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = readPermit,
                        Window = TimeSpan.FromSeconds(readWindowSeconds),
                        QueueLimit = 0,
                        AutoReplenishment = true,
                    }));
        });

        return services;
    }

    private static string GetClientKey(HttpContext httpContext) =>
        httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
}
