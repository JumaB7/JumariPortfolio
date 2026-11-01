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
                    "2025-03",
                    "2025-11",
                    "South African e-commerce app — Angular + ASP.NET Core, GitHub Actions deploy, Azure App Service + Azure SQL.",
                    "personal",
                    "https://veld-supply-cpdddtaqf8epdpe0.southafricanorth-01.azurewebsites.net",
                    null),
                new(
                    "accountant-app",
                    "Accountant App",
                    "Mobile applications",
                    ["Angular", "ASP.NET Core", "SQL Server", "Mobile"],
                    "in-progress",
                    "2025-06",
                    null,
                    "Shared ASP.NET Core API for an Angular admin dashboard and mobile client, hosted on Azure.",
                    "personal",
                    null,
                    null),
                new(
                    "portfolio-dashboard",
                    "Jumari Portfolio",
                    "AI/data analytics",
                    ["Angular", "Highcharts", "ASP.NET Core", "SQL Server", "Azure", "GitHub Actions"],
                    "completed",
                    "2025-08",
                    "2025-11",
                    "This portfolio site + analytics + in-process agent — one Azure App Service, Azure SQL UAT, GitHub Actions on release.",
                    "personal",
                    null,
                    null),
                new(
                    "purple-easyequities",
                    "EasyEquities & EasyID",
                    "Financial technology",
                    ["Angular", "Tailwind CSS", "Node.js", "C#", ".NET Framework", "Highcharts", "Swagger", "Git"],
                    "completed",
                    "2023-01",
                    null,
                    "Professional delivery at Matogen for Purple Group — EasyEquities and EasyID web applications across shared libraries.",
                    "professional",
                    "https://www.easyequities.co.za/",
                    "Matogen / Purple Group"),
                new(
                    "nwu-wisl",
                    "NWU WISL",
                    "Higher education",
                    ["PHP", "Angular", "SQL", "Dropinbase", "Docker"],
                    "completed",
                    "2023-03",
                    "2024-08",
                    "Professional delivery at Matogen for North-West University — Work Integrated and Service Learning (WISL) web application.",
                    "professional",
                    "https://services.nwu.ac.za/centre-teaching-and-learning-ctl/work-integrated-and-service-learning-wisl",
                    "Matogen / North-West University"),
                new(
                    "cypherfuel",
                    "CypherFuel Fleet Telematics",
                    "Fleet telematics",
                    ["Angular", "NestJS", "Node.js", "TypeScript", "Chart.js", "Firebase / Firestore"],
                    "completed",
                    "2023-08",
                    null,
                    "Professional delivery at Matogen — multi-tenant fleet telematics for fuel efficiency, trip analysis, and vehicle/driver scoring.",
                    "professional",
                    "https://cypherfuel.com/",
                    "Matogen / CypherFuel"),
                new(
                    "matogen-zebra",
                    "Matogen Zebra — Jira Workflow Automation",
                    "Workflow automation",
                    ["SQL", "Jira", "Docker"],
                    "completed",
                    "2024-02",
                    "2024-04",
                    "Short-term professional project at Matogen — automated workshop orders and Jira ticket management.",
                    "professional",
                    "https://matogen.com/",
                    "Matogen"),
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
