using PortfolioAPI.Contracts;

namespace PortfolioAPI.Services;

/// <summary>
/// Canonical showcase dataset (same projects the portfolio site advertises).
/// Keep in sync with PortfolioWebApp analytics-demo mapping.
/// </summary>
public static class PortfolioAnalyticsData
{
    public static PortfolioAnalyticsDatasetDto Create() =>
        new(
            "Synthetic showcase data derived from portfolio projects",
            DateTime.UtcNow.ToString("O"),
            4,
            [
                new(
                    "veld-supply",
                    "Veld Supply",
                    "Full-stack web applications",
                    ["Angular", "ASP.NET Core", "SQL Server", "Azure"],
                    "completed",
                    null,
                    null,
                    "Standalone South African e-commerce application with its own ASP.NET Core API and SQL Server database."),
                new(
                    "accountant-app",
                    "Accountant App",
                    "Mobile applications",
                    ["Angular", "ASP.NET Core", "SQL Server", "Mobile"],
                    "in-progress",
                    null,
                    null,
                    "Accounting platform with a shared backend for an admin dashboard web app and a mobile application."),
                new(
                    "portfolio-dashboard",
                    "Portfolio Dashboard",
                    "AI/data analytics",
                    ["Angular", "Highcharts", "ASP.NET Core", "SQL Server"],
                    "in-progress",
                    null,
                    null,
                    "Data dashboard inside this portfolio, powered by the portfolio API and analytics agent."),
            ]);

    public static DashboardOverview ToOverview(PortfolioAnalyticsDatasetDto data)
    {
        var techCounts = data.Projects
            .SelectMany(p => p.Technologies)
            .GroupBy(t => t)
            .Select(g => new ChartSeriesPoint(g.Key, g.Count()))
            .OrderByDescending(p => p.Y)
            .ThenBy(p => p.Name)
            .ToList();

        var categoryCounts = data.Projects
            .GroupBy(p => p.Category)
            .Select(g => new ChartSeriesPoint(g.Key, g.Count()))
            .OrderByDescending(p => p.Y)
            .ThenBy(p => p.Name)
            .ToList();

        return new DashboardOverview(
            [
                new("Independent projects", data.Projects.Count.ToString()),
                new("Years experience", $"~{data.YearsExperience}"),
                new("Core technologies", techCounts.Count.ToString()),
                new("Project categories", categoryCounts.Count.ToString()),
            ],
            techCounts,
            categoryCounts);
    }
}
