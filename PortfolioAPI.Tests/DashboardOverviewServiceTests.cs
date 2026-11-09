using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Moq;
using PortfolioAPI.Contracts;
using PortfolioAPI.Services;
using Xunit;

namespace PortfolioAPI.Tests;

public class DashboardOverviewServiceTests
{
    [Fact]
    public async Task First_request_populates_cache_from_sql()
    {
        var content = CreateContentMock(out var callCount);
        var sut = CreateSut(content.Object, TimeSpan.FromMinutes(15));

        var overview = await sut.GetOverviewAsync();

        Assert.NotNull(overview);
        Assert.Equal(1, callCount.Value);
        Assert.Equal("2", overview.Metrics.Single(m => m.Label == "Independent projects").Value);
        Assert.Contains(overview.TechnologyMix, p => p.Name == "Angular" && p.Y == 2);
    }

    [Fact]
    public async Task Subsequent_requests_return_cached_data_without_sql()
    {
        var content = CreateContentMock(out var callCount);
        var sut = CreateSut(content.Object, TimeSpan.FromMinutes(15));

        var first = await sut.GetOverviewAsync();
        var second = await sut.GetOverviewAsync();

        Assert.Same(first, second);
        Assert.Equal(1, callCount.Value);
    }

    [Fact]
    public async Task Cache_expires_after_configured_period()
    {
        var content = CreateContentMock(out var callCount);
        var sut = CreateSut(content.Object, TimeSpan.FromMilliseconds(50));

        _ = await sut.GetOverviewAsync();
        await Task.Delay(80);
        _ = await sut.GetOverviewAsync();

        Assert.Equal(2, callCount.Value);
    }

    [Fact]
    public async Task Simultaneous_requests_do_not_duplicate_sql_loads()
    {
        var callCount = new StrongBox();
        var releaseSql = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var enteredSql = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);

        var content = new Mock<IPortfolioContentService>(MockBehavior.Strict);
        content
            .Setup(c => c.GetAnalyticsAsync(It.IsAny<CancellationToken>()))
            .Returns(async (CancellationToken ct) =>
            {
                Interlocked.Increment(ref callCount.Value);
                enteredSql.TrySetResult();
                await releaseSql.Task.WaitAsync(ct);
                return SampleDataset();
            });

        var sut = CreateSut(content.Object, TimeSpan.FromMinutes(15));

        var first = sut.GetOverviewAsync();
        await enteredSql.Task.WaitAsync(TimeSpan.FromSeconds(2));

        var second = sut.GetOverviewAsync();
        // Second caller should be waiting on the stampede lock, not SQL yet.
        await Task.Delay(40);
        Assert.Equal(1, callCount.Value);

        releaseSql.SetResult();
        var results = await Task.WhenAll(first, second);

        Assert.Equal(1, callCount.Value);
        Assert.Same(results[0], results[1]);
    }

    [Fact]
    public async Task Invalidate_forces_next_request_to_reload()
    {
        var content = CreateContentMock(out var callCount);
        var sut = CreateSut(content.Object, TimeSpan.FromMinutes(15));

        _ = await sut.GetOverviewAsync();
        sut.Invalidate();
        _ = await sut.GetOverviewAsync();

        Assert.Equal(2, callCount.Value);
    }

    [Fact]
    public async Task Response_structure_matches_overview_contract()
    {
        var content = CreateContentMock(out _);
        var sut = CreateSut(content.Object, TimeSpan.FromMinutes(15));

        var overview = await sut.GetOverviewAsync();

        Assert.NotNull(overview);
        Assert.Equal(4, overview.Metrics.Count);
        Assert.All(overview.Metrics, m =>
        {
            Assert.False(string.IsNullOrWhiteSpace(m.Label));
            Assert.False(string.IsNullOrWhiteSpace(m.Value));
        });
        Assert.NotEmpty(overview.TechnologyMix);
        Assert.NotEmpty(overview.ProjectCategories);

        var expected = PortfolioAnalyticsData.ToOverview(SampleDataset());
        Assert.Equal(expected.Metrics.Select(m => (m.Label, m.Value)), overview.Metrics.Select(m => (m.Label, m.Value)));
        Assert.Equal(expected.TechnologyMix.Select(p => (p.Name, p.Y)), overview.TechnologyMix.Select(p => (p.Name, p.Y)));
        Assert.Equal(
            expected.ProjectCategories.Select(p => (p.Name, p.Y)),
            overview.ProjectCategories.Select(p => (p.Name, p.Y)));
    }

    private static DashboardOverviewService CreateSut(
        IPortfolioContentService content,
        TimeSpan absoluteExpiration)
    {
        var cache = new MemoryCache(new MemoryCacheOptions());
        var options = Options.Create(new DashboardOverviewCacheOptions
        {
            AbsoluteExpiration = absoluteExpiration,
        });

        return new DashboardOverviewService(
            cache,
            content,
            new DashboardOverviewCacheGate(),
            options,
            NullLogger<DashboardOverviewService>.Instance);
    }

    private static Mock<IPortfolioContentService> CreateContentMock(out StrongBox callCount)
    {
        callCount = new StrongBox();
        var box = callCount;
        var content = new Mock<IPortfolioContentService>(MockBehavior.Strict);
        content
            .Setup(c => c.GetAnalyticsAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(() =>
            {
                Interlocked.Increment(ref box.Value);
                return SampleDataset();
            });
        return content;
    }

    private static PortfolioAnalyticsDatasetDto SampleDataset() =>
        new(
            "test",
            DateTime.UtcNow.ToString("O"),
            4,
            new PortfolioOwnerDto(
                "Jumari Blignaut",
                "Full-Stack Software Engineer",
                "Potchefstroom, South Africa",
                "Summary",
                [new PortfolioOwnerHighlightDto("Experience", "Around 4 years")]),
            new PortfolioContactDto("jumablignaut@gmail.com"),
            [new PortfolioSkillGroupDto("Frontend", ["Angular", "TypeScript"])],
            [],
            [
                new PortfolioAnalyticsProjectDto(
                    "veld-supply",
                    "Veld Supply",
                    "Full-stack web applications",
                    ["Angular", "ASP.NET Core"],
                    "completed",
                    "2025-03",
                    "2025-11",
                    "Shop",
                    "personal",
                    null,
                    null),
                new PortfolioAnalyticsProjectDto(
                    "portfolio-dashboard",
                    "Jumari Portfolio",
                    "AI/data analytics",
                    ["Angular", "Highcharts"],
                    "completed",
                    "2025-08",
                    "2025-11",
                    "Portfolio",
                    "personal",
                    null,
                    null),
            ]);

    private sealed class StrongBox
    {
        public int Value;
    }
}
