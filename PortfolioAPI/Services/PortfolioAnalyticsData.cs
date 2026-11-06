using PortfolioAPI.Contracts;

namespace PortfolioAPI.Services;

/// <summary>
/// Canonical portfolio showcase content (aligned with PortfolioWebApp content).
/// </summary>
public static class PortfolioAnalyticsData
{
    /// <summary>
    /// First-person showcase copy for "what's her best project?" — grounded in real project names.
    /// </summary>
    public const string BestProjectReflection =
        "Honestly, it's very hard to pick. Each project has its own strong point. "
        + "On EasyEquities I worked with an amazing team and learned so much from my seniors about coding practices. "
        + "On CypherFuel I had the privilege of working with technical calculations and scoring systems directly from raw telematics data — as a math lover, that was very enjoyable. "
        + "On NWU WISL I had the pleasure of learning more about Dropinbase, Angular, PHP and security from a very experienced senior developer. "
        + "For my personal projects, it's hard to choose because each of them has some element of me or something I enjoy doing. "
        + "Each of them made me grow as a person and as a developer, so I would label them all as \"best\". "
        + "Ask about any project by name if you want the details.";

    /// <summary>Curated recruiter-style answers (first person), keyed for the interview tool.</summary>
    public static readonly IReadOnlyDictionary<string, string> InterviewAnswers =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["current_work"] =
                "Right now I'm building an accounting web app and a client-side mobile app for accounting firms — "
                + "helping them gather documents from clients before deadlines. "
                + "It's one of my personal projects on this portfolio (Accountant App).",
            ["next_role"] =
                "I want to keep growing, keep learning, and gain exposure to more of the software world.",
            ["availability"] =
                "I can start in January 2027.",
            ["remote"] =
                "My preference is fully remote.",
            ["visa"] =
                "I'm looking for fully remote roles, so I don't need visa sponsorship for on-site work.",
            ["proud_of"] =
                "Professionally, EasyEquities — I learned a huge amount from an amazing team. "
                + "Personally, I'm proud of the accounting project and of learning to build an AI agent for this portfolio.",
            ["easyequities_contribution"] =
                "On EasyEquities we contributed evenly as a team. I focused on full-stack work: creating components from scratch, "
                + "fixing bugs, integrating new API endpoints, updating older components, and doing code reviews. "
                + "I was fully responsible for all the charts — at that stage I had the most Highcharts experience on the team.",
            ["frontend_vs_fullstack"] =
                "I enjoy frontend more, but I'm full-stack and equally strong on both sides.",
            ["fintech"] =
                "Yes — I've done professional fintech delivery on EasyEquities (and EasyID) at Matogen for Purple Group.",
            ["mentoring"] =
                "I haven't formally mentored juniors yet.",
            ["ways_of_working"] =
                "Yes — I'm comfortable with code reviews, Agile ways of working, and CI/CD "
                + "(including GitHub Actions deploys on my personal Azure projects).",
        };

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
                    "Full-stack delivery across Purple Group (EasyEquities / EasyID), NWU WISL, CypherFuel fleet telematics, and internal workflow automation. Day-to-day: Angular + .NET features, shared component libraries, API integration, Highcharts, code reviews, and production support.",
                    ["Angular", "C#", ".NET", "TypeScript", "Highcharts", "NestJS", "SQL", "Azure"]),
                new(
                    "Bachelor of Engineering in Computer and Electronic Engineering",
                    "North-West University",
                    "2019 – 2022",
                    "Potchefstroom, South Africa",
                    "BEng Computer and Electronic Engineering, graduated with Distinction. Strong foundation in maths, systems, and software that still shapes how I approach scoring, data, and full-stack problem solving.",
                    ["Engineering", "Mathematics"]),
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
                    "Personal South African e-commerce showcase: Angular storefront + ASP.NET Core API, PayFast payments, GitHub Actions CI/CD to Azure App Service and Azure SQL.",
                    "personal",
                    "https://veldsupply.jumariblignaut.dev",
                    null),
                new(
                    "accountant-app",
                    "Accountant App",
                    "Mobile applications",
                    ["Angular", "ASP.NET Core", "SQL Server", "Mobile"],
                    "in-progress",
                    "2025-06",
                    null,
                    "Personal product for accounting firms: admin web app plus client mobile app to gather documents from clients before deadlines. Shared ASP.NET Core API, Angular admin, Expo/mobile client, Azure hosting.",
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
                    "This portfolio site — projects, skills, experience, analytics dashboard, and an in-process rule-based AI agent over the same SQL showcase dataset. One Azure App Service + Azure SQL UAT, shipped via GitHub Actions.",
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
                    "Professional fintech at Matogen for Purple Group. Full-stack on EasyEquities / EasyID: new components, API integrations, bug fixes, reviews, and owned all Highcharts work when that was my deepest FE strength on the team.",
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
                    "Professional delivery at Matogen for North-West University — Work Integrated and Service Learning (WISL). Learned Dropinbase, Angular, PHP, and security practices alongside a very experienced senior developer.",
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
                    "Professional multi-tenant fleet telematics at Matogen — fuel efficiency, trip analysis, and vehicle/driver scoring from raw telematics data. Strong maths/scoring focus; Angular + NestJS + Firebase.",
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
                    "Short-term professional project at Matogen — automated workshop orders and Jira ticket management with SQL, Jira, and Docker.",
                    "professional",
                    "https://matogen.com/",
                    "Matogen"),
            ]);

    /// <summary>Aliases → project id for router / detail lookup.</summary>
    public static readonly IReadOnlyDictionary<string, string> ProjectAliases =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["veld supply"] = "veld-supply",
            ["veld"] = "veld-supply",
            ["accountant app"] = "accountant-app",
            ["accounting app"] = "accountant-app",
            ["accounting"] = "accountant-app",
            ["portfolio"] = "portfolio-dashboard",
            ["portfolio dashboard"] = "portfolio-dashboard",
            ["jumari portfolio"] = "portfolio-dashboard",
            ["ai agent"] = "portfolio-dashboard",
            ["easyequities"] = "purple-easyequities",
            ["easy equities"] = "purple-easyequities",
            ["easyid"] = "purple-easyequities",
            ["easy id"] = "purple-easyequities",
            ["purple"] = "purple-easyequities",
            ["nwu"] = "nwu-wisl",
            ["nwu wisl"] = "nwu-wisl",
            ["wisl"] = "nwu-wisl",
            ["cypherfuel"] = "cypherfuel",
            ["cypher fuel"] = "cypherfuel",
            ["fleet"] = "cypherfuel",
            ["zebra"] = "matogen-zebra",
            ["jira"] = "matogen-zebra",
        };

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
