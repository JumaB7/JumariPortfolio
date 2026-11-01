using System.Text.RegularExpressions;
using PortfolioAPI.Services;

namespace PortfolioAPI.Agent;

public sealed record RouteDecision(
    string Kind,
    string? ToolName = null,
    Dictionary<string, object?>? Arguments = null,
    string? Answer = null);

public static partial class AgentRouter
{
    public const string GreetingAnswer =
        "Hi — I can answer questions about this portfolio showcase: projects, skills, experience, recruiter FAQs, and contact details.";

    public const string UnsupportedAnswer =
        "I only answer grounded questions about this portfolio showcase dataset. "
        + "Try asking about Jumari, projects, technologies, categories, experience, or interview topics. "
        + "Examples: 'How experienced is she?', 'What's her best project?', 'Tell me about Veld Supply'.";

    private static readonly string[] SkillTechs =
    [
        "angular", "typescript", "javascript", "c#", "csharp", ".net", "dotnet", "asp.net",
        "sql", "azure", "highcharts", "nestjs", "node", "php", "tailwind", "firebase",
    ];

    public static RouteDecision? Route(string message)
    {
        var text = Normalize(message);

        if (text is "hi" or "hello" or "hey" or "hi there"
            || GreetingRegex().IsMatch(text))
        {
            return new RouteDecision("greeting", Answer: GreetingAnswer);
        }

        if (HasWord(text, "weather") || HasWord(text, "employee") || HasWord(text, "overtime")
            || HasWord(text, "sales") || HasWord(text, "revenue") || HasWord(text, "sku")
            || text.Contains("select *", StringComparison.Ordinal)
            || text.Contains("run sql", StringComparison.Ordinal)
            || HasWord(text, "hr"))
        {
            return new RouteDecision("unsupported", Answer: UnsupportedAnswer);
        }

        if (JumariRegex().IsMatch(text)
            || text is "who are you" or "who built this" or "who owns this portfolio"
            || text.Contains("tell me about yourself", StringComparison.Ordinal)
            || text.Contains("tell me about jumari", StringComparison.Ordinal)
            || text.Contains("introduce yourself", StringComparison.Ordinal)
            || text.Contains("introduction", StringComparison.Ordinal)
            || (HasWord(text, "jumari") && (HasWord(text, "who") || HasWord(text, "about") || HasWord(text, "bio") || HasWord(text, "background") || HasWord(text, "profile"))))
        {
            return new RouteDecision("tool", "get_owner_profile", new Dictionary<string, object?>());
        }

        if (HasWord(text, "skill") || HasWord(text, "skills") || text.Contains("tech stack", StringComparison.Ordinal)
            || text.Contains("technology stack", StringComparison.Ordinal)
            || text.Contains("what technologies", StringComparison.Ordinal)
            || text.Contains("what tech", StringComparison.Ordinal)
            || text.Contains("programming language", StringComparison.Ordinal)
            || text.Contains("what languages", StringComparison.Ordinal)
            || text.Contains("what can jumari", StringComparison.Ordinal)
            || (text.Contains("what can you", StringComparison.Ordinal) && text.Contains("build", StringComparison.Ordinal)))
        {
            var args = new Dictionary<string, object?>();
            if (text.Contains("frontend", StringComparison.Ordinal) || text.Contains("front-end", StringComparison.Ordinal))
                args["group"] = "Frontend";
            else if (text.Contains("backend", StringComparison.Ordinal) || text.Contains("back-end", StringComparison.Ordinal))
                args["group"] = "Backend";
            else if (text.Contains("databases", StringComparison.Ordinal) || HasWord(text, "database") || HasWord(text, "sql"))
                args["group"] = "Databases";
            else if (text.Contains("tools", StringComparison.Ordinal) || text.Contains("platforms", StringComparison.Ordinal))
                args["group"] = "Tools & Platforms";
            return new RouteDecision("tool", "get_skills", args);
        }

        // Recruiter-style interview topics (before work-history matching).
        if (text.Contains("working on", StringComparison.Ordinal)
            || text.Contains("currently working", StringComparison.Ordinal)
            || text.Contains("current project", StringComparison.Ordinal)
            || text.Contains("what are you building", StringComparison.Ordinal)
            || text.Contains("what is she building", StringComparison.Ordinal)
            || text.Contains("what is she working", StringComparison.Ordinal)
            || text.Contains("what is jumari working", StringComparison.Ordinal)
            || text.Contains("right now", StringComparison.Ordinal) && text.Contains("work", StringComparison.Ordinal))
        {
            return Interview("current_work");
        }

        if (text.Contains("next job", StringComparison.Ordinal)
            || text.Contains("next role", StringComparison.Ordinal)
            || text.Contains("looking for in", StringComparison.Ordinal)
            || text.Contains("want in your next", StringComparison.Ordinal)
            || text.Contains("want in her next", StringComparison.Ordinal)
            || text.Contains("career goals", StringComparison.Ordinal)
            || text.Contains("what do you want", StringComparison.Ordinal)
            || text.Contains("what does she want", StringComparison.Ordinal))
        {
            return Interview("next_role");
        }

        if (text.Contains("when can you start", StringComparison.Ordinal)
            || text.Contains("when can she start", StringComparison.Ordinal)
            || text.Contains("start date", StringComparison.Ordinal)
            || text.Contains("notice period", StringComparison.Ordinal)
            || text.Contains("available to start", StringComparison.Ordinal)
            || text.Contains("availability", StringComparison.Ordinal)
            || (HasWord(text, "start") && (HasWord(text, "when") || HasWord(text, "available"))))
        {
            return Interview("availability");
        }

        if (HasWord(text, "remote") || HasWord(text, "hybrid") || text.Contains("work from home", StringComparison.Ordinal)
            || text.Contains("location preference", StringComparison.Ordinal)
            || text.Contains("onsite", StringComparison.Ordinal) || text.Contains("on-site", StringComparison.Ordinal)
            || text.Contains("work location", StringComparison.Ordinal))
        {
            return Interview("remote");
        }

        if (HasWord(text, "visa") || HasWord(text, "sponsorship") || text.Contains("work permit", StringComparison.Ordinal))
        {
            return Interview("visa");
        }

        if (text.Contains("proud of", StringComparison.Ordinal)
            || text.Contains("most proud", StringComparison.Ordinal)
            || (HasWord(text, "proud") && HasWord(text, "project")))
        {
            return Interview("proud_of");
        }

        if ((text.Contains("easyequities", StringComparison.Ordinal) || text.Contains("easy equities", StringComparison.Ordinal))
            && (text.Contains("contribu", StringComparison.Ordinal) || text.Contains("your role", StringComparison.Ordinal)
                || text.Contains("her role", StringComparison.Ordinal) || text.Contains("what did you", StringComparison.Ordinal)
                || text.Contains("what did she", StringComparison.Ordinal) || text.Contains("ownership", StringComparison.Ordinal)
                || text.Contains("responsible", StringComparison.Ordinal) || HasWord(text, "charts")
                || text.Contains("highcharts", StringComparison.Ordinal)
                || (text.Contains("team", StringComparison.Ordinal) && !text.Contains("tell me about", StringComparison.Ordinal))))
        {
            return Interview("easyequities_contribution");
        }

        if (text.Contains("frontend or", StringComparison.Ordinal) || text.Contains("front-end or", StringComparison.Ordinal)
            || text.Contains("full stack or", StringComparison.Ordinal) || text.Contains("fullstack or", StringComparison.Ordinal)
            || text.Contains("full-stack or", StringComparison.Ordinal)
            || text.Contains("prefer frontend", StringComparison.Ordinal) || text.Contains("prefer front-end", StringComparison.Ordinal)
            || text.Contains("stronger in", StringComparison.Ordinal)
            || text.Contains("front end or back", StringComparison.Ordinal)
            || (HasWord(text, "frontend") && (HasWord(text, "backend") || text.Contains("full", StringComparison.Ordinal))))
        {
            return Interview("frontend_vs_fullstack");
        }

        if (HasWord(text, "fintech") || text.Contains("financial technology", StringComparison.Ordinal)
            || (text.Contains("financial", StringComparison.Ordinal) && HasWord(text, "experience")))
        {
            return Interview("fintech");
        }

        if (HasWord(text, "mentor") || HasWord(text, "mentored") || HasWord(text, "mentoring")
            || text.Contains("junior developer", StringComparison.Ordinal) || text.Contains("juniors", StringComparison.Ordinal))
        {
            return Interview("mentoring");
        }

        if (text.Contains("code review", StringComparison.Ordinal) || HasWord(text, "agile")
            || text.Contains("ci/cd", StringComparison.Ordinal) || text.Contains("ci cd", StringComparison.Ordinal)
            || HasWord(text, "devops") || text.Contains("ways of working", StringComparison.Ordinal)
            || text.Contains("github actions", StringComparison.Ordinal))
        {
            return Interview("ways_of_working");
        }

        if (HasWord(text, "experienced")
            || text.Contains("how experienced", StringComparison.Ordinal)
            || text.Contains("years of experience", StringComparison.Ordinal)
            || text.Contains("years experience", StringComparison.Ordinal)
            || text.Contains("experience level", StringComparison.Ordinal)
            || text.Contains("how many years", StringComparison.Ordinal)
            || (HasWord(text, "seniority") && (HasWord(text, "her") || HasWord(text, "she") || HasWord(text, "jumari"))))
        {
            return new RouteDecision("tool", "get_portfolio_summary", new Dictionary<string, object?>
            {
                ["focus"] = "experience",
            });
        }

        if (HasWord(text, "project")
            && (HasWord(text, "best") || HasWord(text, "favourite") || HasWord(text, "favorite")
                || HasWord(text, "highlight") || HasWord(text, "standout") || HasWord(text, "impressive")
                || text.Contains("top project", StringComparison.Ordinal)))
        {
            return new RouteDecision("tool", "get_featured_projects", new Dictionary<string, object?>());
        }

        if ((HasWord(text, "experience") || HasWord(text, "employer") || WorkHistoryRegex().IsMatch(text)
                || text.Contains("where has", StringComparison.Ordinal) || text.Contains("where did", StringComparison.Ordinal)
                || text.Contains("matogen", StringComparison.Ordinal) || text.Contains("education", StringComparison.Ordinal)
                || text.Contains("degree", StringComparison.Ordinal) || text.Contains("university", StringComparison.Ordinal)
                || text.Contains("studied", StringComparison.Ordinal) || text.Contains("graduate", StringComparison.Ordinal)
                || text.Contains("cv", StringComparison.Ordinal) && text.Contains("work", StringComparison.Ordinal)))
        {
            return new RouteDecision("tool", "get_experience", new Dictionary<string, object?>());
        }

        if (HasWord(text, "email") || HasWord(text, "contact")
            || text.Contains("how can i reach", StringComparison.Ordinal)
            || text.Contains("get in touch", StringComparison.Ordinal)
            || text.Contains("reach out", StringComparison.Ordinal))
        {
            return new RouteDecision("tool", "get_contact", new Dictionary<string, object?>());
        }

        if (text.Contains("how many projects", StringComparison.Ordinal)
            || text.Contains("project count", StringComparison.Ordinal)
            || text.Contains("portfolio summary", StringComparison.Ordinal)
            || text is "how many projects are there" or "how many projects do you have"
            || text.Contains("overview of the portfolio", StringComparison.Ordinal)
            || (HasWord(text, "summary") && (HasWord(text, "portfolio") || HasWord(text, "dashboard"))))
        {
            return new RouteDecision("tool", "get_portfolio_summary", new Dictionary<string, object?>());
        }

        if (text.Contains("technolog", StringComparison.Ordinal)
            && (text.Contains("most", StringComparison.Ordinal) || text.Contains("usage", StringComparison.Ordinal)
                || text.Contains("used", StringComparison.Ordinal) || text.Contains("mix", StringComparison.Ordinal)
                || HasWord(text, "top")))
        {
            return new RouteDecision("tool", "get_technology_usage", new Dictionary<string, object?> { ["top_n"] = 10 });
        }

        if (text.Contains("categor", StringComparison.Ordinal)
            && (text.Contains("distribution", StringComparison.Ordinal) || text.Contains("mix", StringComparison.Ordinal)
                || text.Contains("most", StringComparison.Ordinal) || HasWord(text, "top")
                || text.Contains("what kind", StringComparison.Ordinal)))
        {
            return new RouteDecision("tool", "get_category_distribution", new Dictionary<string, object?> { ["top_n"] = 10 });
        }

        // Named project detail via aliases (before generic list).
        var projectId = MatchProjectAlias(text);
        if (projectId is not null
            && (text.Contains("about", StringComparison.Ordinal) || text.Contains("detail", StringComparison.Ordinal)
                || text.Contains("tell me", StringComparison.Ordinal) || text.Contains("describe", StringComparison.Ordinal)
                || text.Contains("what is", StringComparison.Ordinal) || text.Contains("what's", StringComparison.Ordinal)
                || text.Contains("technologies", StringComparison.Ordinal) || text.Contains("tech", StringComparison.Ordinal)
                || text.StartsWith(projectId.Replace('-', ' '), StringComparison.Ordinal)
                || PortfolioAnalyticsData.ProjectAliases.Keys.Any(a =>
                    text.Equals(a, StringComparison.OrdinalIgnoreCase))))
        {
            return new RouteDecision("tool", "get_project_detail", new Dictionary<string, object?> { ["query"] = projectId });
        }

        var detail = DetailRegex().Match(text);
        if (detail.Success)
        {
            var query = detail.Groups[1].Value.Trim(' ', '?', '!', '.');
            if (!string.IsNullOrWhiteSpace(query) && !IsGenericProjectQuery(query))
            {
                return new RouteDecision("tool", "get_project_detail", new Dictionary<string, object?> { ["query"] = query });
            }
        }

        foreach (var tech in SkillTechs)
        {
            if (text.Contains(tech, StringComparison.Ordinal)
                && (text.Contains("project", StringComparison.Ordinal) || text.Contains("which", StringComparison.Ordinal)
                    || text.Contains("use", StringComparison.Ordinal) || text.Contains("built with", StringComparison.Ordinal)
                    || text.Contains("experience with", StringComparison.Ordinal) && text.Contains("project", StringComparison.Ordinal)))
            {
                var normalizedTech = tech switch
                {
                    "csharp" or "c#" => "C#",
                    "dotnet" or ".net" or "asp.net" => ".NET",
                    "node" => "Node",
                    _ => char.ToUpperInvariant(tech[0]) + tech[1..],
                };
                if (tech is "angular") normalizedTech = "Angular";
                if (tech is "typescript") normalizedTech = "TypeScript";
                if (tech is "azure") normalizedTech = "Azure";
                if (tech is "sql") normalizedTech = "SQL";
                if (tech is "highcharts") normalizedTech = "Highcharts";
                if (tech is "nestjs") normalizedTech = "NestJS";
                if (tech is "php") normalizedTech = "PHP";
                if (tech is "tailwind") normalizedTech = "Tailwind";
                if (tech is "firebase") normalizedTech = "Firebase";
                return new RouteDecision("tool", "list_projects", new Dictionary<string, object?> { ["technology"] = normalizedTech });
            }
        }

        if ((text.Contains("list", StringComparison.Ordinal) || text.Contains("show", StringComparison.Ordinal)
                || text.Contains("what projects", StringComparison.Ordinal) || text.Contains("which projects", StringComparison.Ordinal)
                || text.Contains("all projects", StringComparison.Ordinal))
            && text.Contains("project", StringComparison.Ordinal))
        {
            var args = new Dictionary<string, object?>();
            if (text.Contains("completed", StringComparison.Ordinal)) args["status"] = "completed";
            else if (text.Contains("in progress", StringComparison.Ordinal) || text.Contains("in-progress", StringComparison.Ordinal))
                args["status"] = "in-progress";
            if (text.Contains("personal", StringComparison.Ordinal)) args["kind"] = "personal";
            else if (text.Contains("professional", StringComparison.Ordinal) || text.Contains("work project", StringComparison.Ordinal)
                     || text.Contains("client project", StringComparison.Ordinal))
                args["kind"] = "professional";
            return new RouteDecision("tool", "list_projects", args);
        }

        // Bare project name / alias as the whole question.
        if (projectId is not null)
        {
            return new RouteDecision("tool", "get_project_detail", new Dictionary<string, object?> { ["query"] = projectId });
        }

        return null;
    }

    private static RouteDecision Interview(string topic) =>
        new("tool", "get_interview_answer", new Dictionary<string, object?> { ["topic"] = topic });

    private static string? MatchProjectAlias(string text)
    {
        foreach (var (alias, id) in PortfolioAnalyticsData.ProjectAliases
                     .OrderByDescending(kv => kv.Key.Length))
        {
            if (text.Contains(alias, StringComparison.OrdinalIgnoreCase))
                return id;
        }

        return null;
    }

    private static string Normalize(string message)
    {
        var cleaned = message.Trim().ToLowerInvariant();
        cleaned = TrailingPunctuationRegex().Replace(cleaned, "");
        cleaned = WhitespaceRegex().Replace(cleaned, " ");
        return cleaned;
    }

    private static bool HasWord(string text, string word) =>
        Regex.IsMatch(text, $@"\b{Regex.Escape(word)}\b", RegexOptions.IgnoreCase);

    private static bool IsGenericProjectQuery(string query)
    {
        var q = query.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(q) || q is "this" or "that" or "it" or "the dashboard" or "this dashboard"
            or "yourself" or "you" or "her" or "him")
            return true;
        return false;
    }

    [GeneratedRegex(@"^(hi|hello|hey)( there)?$")]
    private static partial Regex GreetingRegex();

    [GeneratedRegex(@"\bwho is jumari\b|\bwho'?s jumari\b|\babout jumari\b")]
    private static partial Regex JumariRegex();

    [GeneratedRegex(@"\b(worked|works|employer|employment)\b")]
    private static partial Regex WorkHistoryRegex();

    [GeneratedRegex(@"(?:tell me about|describe|details (?:on|for)|what is|what's)\s+(.+)$")]
    private static partial Regex DetailRegex();

    [GeneratedRegex(@"[?!.,]+$")]
    private static partial Regex TrailingPunctuationRegex();

    [GeneratedRegex(@"\s+")]
    private static partial Regex WhitespaceRegex();
}
