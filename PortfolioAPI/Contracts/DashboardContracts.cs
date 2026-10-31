namespace PortfolioAPI.Contracts;

public record DashboardMetric(string Label, string Value);

public record ChartSeriesPoint(string Name, double Y);

public record DashboardOverview(
    IReadOnlyList<DashboardMetric> Metrics,
    IReadOnlyList<ChartSeriesPoint> TechnologyMix,
    IReadOnlyList<ChartSeriesPoint> ProjectCategories);

/// <summary>
/// Shared portfolio content used by the dashboard charts and the site-wide AI agent.
/// </summary>
public record PortfolioAnalyticsDatasetDto(
    string SourceLabel,
    string GeneratedAt,
    int YearsExperience,
    PortfolioOwnerDto Owner,
    PortfolioContactDto Contact,
    IReadOnlyList<PortfolioSkillGroupDto> SkillGroups,
    IReadOnlyList<PortfolioExperienceDto> Experience,
    IReadOnlyList<PortfolioAnalyticsProjectDto> Projects);

public record PortfolioOwnerDto(
    string Name,
    string Role,
    string Location,
    string Summary,
    IReadOnlyList<PortfolioOwnerHighlightDto> Highlights);

public record PortfolioOwnerHighlightDto(string Label, string Value);

public record PortfolioContactDto(string Email);

public record PortfolioSkillGroupDto(string Title, IReadOnlyList<string> Skills);

public record PortfolioExperienceDto(
    string Title,
    string Organization,
    string Dates,
    string Location,
    string Description,
    IReadOnlyList<string> Technologies);

public record PortfolioAnalyticsProjectDto(
    string Id,
    string Name,
    string Category,
    IReadOnlyList<string> Technologies,
    string? Status,
    string? StartDate,
    string? EndDate,
    string? Description);
