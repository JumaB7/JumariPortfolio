namespace PortfolioAPI.Services;

/// <summary>
/// Process-wide lock so concurrent cache misses share one SQL load.
/// </summary>
public sealed class DashboardOverviewCacheGate
{
    public SemaphoreSlim Lock { get; } = new(1, 1);
}
