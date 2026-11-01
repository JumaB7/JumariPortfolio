using PortfolioAPI.Contracts;

namespace PortfolioAPI.Services;

/// <summary>
/// Canonical portfolio showcase content (aligned with PortfolioWebApp content).
/// </summary>
public static class PortfolioAnalyticsData
{
    public static PortfolioAnalyticsDatasetDto Create() =>
        new(
            "Portfolio site content shared with the AI agent",
            DateTime.UtcNow.ToString("O"),
            4,
            new PortfolioOwnerDto(
                "Jumari Blignaut",
                "Full-Stack Software Engineer",
                "Potchefstroom, South Africa",
                "Full-Stack Software Engineer with nearly four years of professional experience developing and maintaining web applications across financial technology, higher education and fleet telematics. Experienced in frontend and backend development, with a strong technical foundation in C#, .NET, Angular, TypeScript and SQL. Holds a Bachelor of Engineering in Computer and Electronic Engineering from North-West University, completed with distinction.",
                [
                    new("Education", "BEng Computer & Electronic Engineering — NWU (Distinction)"),
                    new("Experience", "Nearly 4 years professional"),
                    new("Focus", "Angular · ASP.NET · SQL Server · Azure"),
                    new("Based in", "Potchefstroom, South Africa"),
                ]),
            new PortfolioContactDto("jumablignaut@gmail.com"),
            [
                new("Frontend", ["Angular", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind"]),
                new("Backend", ["C#", "ASP.NET Core", "PHP", "REST APIs", "Node.js"]),
                new("Databases", ["SQL Server", "SQL", "Database design"]),
                new("Tools & Platforms", ["Git", "Azure", "Visual Studio", "VS Code", "Highcharts"]),
            ],
            [
                new(
                    "Software Engineer",
                    "Matogen",
                    "01/2023 – Present",
                    "Potchefstroom, South Africa",
                    "Contributed to the development and maintenance of software solutions across financial technology, higher education, fleet telematics and workflow automation.",
                    ["Angular", "C#", ".NET", "TypeScript", "Highcharts", "NestJS", "SQL", "Azure"]),
                new(
                    "Bachelor of Engineering in Computer and Electronic Engineering",
                    "North-West University",
                    "2019 – 2022",
                    "Potchefstroom, South Africa",
                    "Academic achievement: Graduated with Distinction.",
                    ["Engineering"]),
            ],
            [
                new(
                    "veld-supply",
                    "Veld Supply",
                    "Full-stack web applications",
                    ["Angular", "ASP.NET Core", "SQL Server", "Azure", "PayFast"],
                    "completed",
                    null,
                    null,
                    "South African e-commerce app — Angular + ASP.NET Core, GitHub Actions deploy, Azure App Service + Azure SQL."),
                new(
                    "accountant-app",
                    "Accountant App",
                    "Mobile applications",
                    ["Angular", "ASP.NET Core", "SQL Server", "Mobile"],
                    "in-progress",
                    null,
                    null,
                    "Shared ASP.NET Core API for an Angular admin dashboard and mobile client, hosted on Azure."),
                new(
                    "portfolio-dashboard",
                    "Jumari Portfolio",
                    "AI/data analytics",
                    ["Angular", "Highcharts", "ASP.NET Core", "SQL Server", "Azure", "GitHub Actions"],
                    "completed",
                    null,
                    null,
                    "This portfolio site + analytics + in-process agent — one Azure App Service, Azure SQL UAT, GitHub Actions on release."),
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
