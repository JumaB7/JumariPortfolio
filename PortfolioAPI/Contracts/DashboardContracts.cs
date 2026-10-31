namespace PortfolioAPI.Contracts;

public record DashboardMetric(string Label, string Value);

public record ChartSeriesPoint(string Name, double Y);

public record DashboardOverview(
    IReadOnlyList<DashboardMetric> Metrics,
    IReadOnlyList<ChartSeriesPoint> TechnologyMix,
    IReadOnlyList<ChartSeriesPoint> ProjectCategories);

/// <summary>
/// Shared showcase analytics dataset used by the dashboard charts and the AI agent.
/// </summary>
public record PortfolioAnalyticsDatasetDto(
    string SourceLabel,
    string GeneratedAt,
    int YearsExperience,
    IReadOnlyList<PortfolioAnalyticsProjectDto> Projects);

public record PortfolioAnalyticsProjectDto(
    string Id,
    string Name,
    string Category,
    IReadOnlyList<string> Technologies,
    string? Status,
    string? StartDate,
    string? EndDate,
    string? Description);
