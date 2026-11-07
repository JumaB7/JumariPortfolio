namespace PortfolioAPI.Services;

public sealed class DashboardOverviewCacheOptions
{
    public const string CacheKey = "dashboard:overview";

    /// <summary>Absolute lifetime for the cached overview. Default 15 minutes.</summary>
    public TimeSpan AbsoluteExpiration { get; set; } = TimeSpan.FromMinutes(15);
}
