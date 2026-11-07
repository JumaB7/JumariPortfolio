using System.Diagnostics;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using PortfolioAPI.Contracts;

namespace PortfolioAPI.Services;

public sealed class DashboardOverviewService(
    IMemoryCache cache,
    IPortfolioContentService content,
    DashboardOverviewCacheGate gate,
    IOptions<DashboardOverviewCacheOptions> options,
    ILogger<DashboardOverviewService> logger) : IDashboardOverviewService
{
    public async Task<DashboardOverview?> GetOverviewAsync(CancellationToken ct = default)
    {
        var totalSw = Stopwatch.StartNew();
        var cacheKey = DashboardOverviewCacheOptions.CacheKey;

        if (cache.TryGetValue(cacheKey, out DashboardOverview? cached) && cached is not null)
        {
            totalSw.Stop();
            logger.LogInformation(
                "Dashboard overview cache hit. CacheHit={CacheHit} TotalElapsedMs={TotalElapsedMs}",
                true,
                totalSw.ElapsedMilliseconds);
            return cached;
        }

        await gate.Lock.WaitAsync(ct);
        try
        {
            if (cache.TryGetValue(cacheKey, out cached) && cached is not null)
            {
                totalSw.Stop();
                logger.LogInformation(
                    "Dashboard overview cache hit. CacheHit={CacheHit} TotalElapsedMs={TotalElapsedMs}",
                    true,
                    totalSw.ElapsedMilliseconds);
                return cached;
            }

            logger.LogInformation(
                "Dashboard overview cache miss. CacheHit={CacheHit}",
                false);

            var populateSw = Stopwatch.StartNew();
            var data = await content.GetAnalyticsAsync(ct);
            if (data is null)
            {
                populateSw.Stop();
                totalSw.Stop();
                logger.LogInformation(
                    "Dashboard overview cache population finished with no data. CacheHit={CacheHit} PopulateElapsedMs={PopulateElapsedMs} TotalElapsedMs={TotalElapsedMs}",
                    false,
                    populateSw.ElapsedMilliseconds,
                    totalSw.ElapsedMilliseconds);
                return null;
            }

            var overview = PortfolioAnalyticsData.ToOverview(data);
            cache.Set(
                cacheKey,
                overview,
                new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = options.Value.AbsoluteExpiration,
                });
            populateSw.Stop();
            totalSw.Stop();

            logger.LogInformation(
                "Dashboard overview cache populated. CacheHit={CacheHit} PopulateElapsedMs={PopulateElapsedMs} TotalElapsedMs={TotalElapsedMs} AbsoluteExpirationMinutes={AbsoluteExpirationMinutes}",
                false,
                populateSw.ElapsedMilliseconds,
                totalSw.ElapsedMilliseconds,
                options.Value.AbsoluteExpiration.TotalMinutes);

            return overview;
        }
        finally
        {
            gate.Lock.Release();
        }
    }

    public void Invalidate()
    {
        cache.Remove(DashboardOverviewCacheOptions.CacheKey);
        logger.LogInformation("Dashboard overview cache invalidated. CacheKey={CacheKey}", DashboardOverviewCacheOptions.CacheKey);
    }
}
