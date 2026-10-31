using System.Text.RegularExpressions;

namespace PortfolioAPI.Agent;

public sealed record RouteDecision(
    string Kind,
    string? ToolName = null,
    Dictionary<string, object?>? Arguments = null,
    string? Answer = null);

public static partial class AgentRouter
{
    public const string GreetingAnswer =
        "Hi — I can answer questions about this portfolio showcase: projects, skills, experience, and contact details.";

    public const string UnsupportedAnswer =
        "I only answer grounded questions about this portfolio showcase dataset. "
        + "Try asking about Jumari, projects, technologies, categories, or experience.";

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
            || (HasWord(text, "jumari") && (HasWord(text, "who") || HasWord(text, "about") || HasWord(text, "bio") || HasWord(text, "background"))))
        {
            return new RouteDecision("tool", "get_owner_profile", new Dictionary<string, object?>());
        }

        if (HasWord(text, "skill") || HasWord(text, "skills") || text.Contains("tech stack", StringComparison.Ordinal)
            || text.Contains("what can jumari", StringComparison.Ordinal))
        {
            var args = new Dictionary<string, object?>();
            if (text.Contains("frontend", StringComparison.Ordinal)) args["group"] = "Frontend";
            else if (text.Contains("backend", StringComparison.Ordinal)) args["group"] = "Backend";
            else if (text.Contains("databases", StringComparison.Ordinal)) args["group"] = "Databases";
            else if (text.Contains("tools", StringComparison.Ordinal)) args["group"] = "Tools & Platforms";
            return new RouteDecision("tool", "get_skills", args);
        }

        if ((HasWord(text, "experience") || HasWord(text, "employer") || WorkRegex().IsMatch(text)
                || text.Contains("where has", StringComparison.Ordinal) || text.Contains("where did", StringComparison.Ordinal)
                || text.Contains("matogen", StringComparison.Ordinal) || text.Contains("education", StringComparison.Ordinal)
                || text.Contains("degree", StringComparison.Ordinal) || text.Contains("university", StringComparison.Ordinal))
            && !text.Contains("years of experience", StringComparison.Ordinal)
            && !text.Contains("years experience", StringComparison.Ordinal))
        {
            return new RouteDecision("tool", "get_experience", new Dictionary<string, object?>());
        }

        if (HasWord(text, "email") || HasWord(text, "contact")
            || text.Contains("how can i reach", StringComparison.Ordinal)
            || text.Contains("get in touch", StringComparison.Ordinal))
        {
            return new RouteDecision("tool", "get_contact", new Dictionary<string, object?>());
        }

        if (text.Contains("how many projects", StringComparison.Ordinal)
            || text.Contains("project count", StringComparison.Ordinal)
            || text.Contains("portfolio summary", StringComparison.Ordinal)
            || text.Contains("years of experience", StringComparison.Ordinal)
            || text.Contains("years experience", StringComparison.Ordinal)
            || text is "how many projects are there" or "how many projects do you have"
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
                || text.Contains("most", StringComparison.Ordinal) || HasWord(text, "top")))
        {
            return new RouteDecision("tool", "get_category_distribution", new Dictionary<string, object?> { ["top_n"] = 10 });
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

        foreach (var known in new[] { "veld supply", "accountant app", "portfolio dashboard" })
        {
            if (text.Contains(known, StringComparison.Ordinal)
                && (text.Contains("about", StringComparison.Ordinal) || text.Contains("detail", StringComparison.Ordinal)
                    || text.Contains("technologies", StringComparison.Ordinal) || text.Contains("tech", StringComparison.Ordinal)))
            {
                return new RouteDecision("tool", "get_project_detail", new Dictionary<string, object?> { ["query"] = known });
            }
        }

        if (text.Contains("angular", StringComparison.Ordinal)
            && (text.Contains("project", StringComparison.Ordinal) || text.Contains("which", StringComparison.Ordinal)
                || text.Contains("use", StringComparison.Ordinal)))
        {
            return new RouteDecision("tool", "list_projects", new Dictionary<string, object?> { ["technology"] = "Angular" });
        }

        if (text.Contains("list", StringComparison.Ordinal) && text.Contains("project", StringComparison.Ordinal))
        {
            var args = new Dictionary<string, object?>();
            if (text.Contains("completed", StringComparison.Ordinal)) args["status"] = "completed";
            else if (text.Contains("in progress", StringComparison.Ordinal) || text.Contains("in-progress", StringComparison.Ordinal))
                args["status"] = "in-progress";
            return new RouteDecision("tool", "list_projects", args);
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
        if (string.IsNullOrWhiteSpace(q) || q is "this" or "that" or "it" or "the dashboard" or "this dashboard")
            return true;
        return false;
    }

    [GeneratedRegex(@"^(hi|hello|hey)( there)?$")]
    private static partial Regex GreetingRegex();

    [GeneratedRegex(@"\bwho is jumari\b|\bwho'?s jumari\b|\babout jumari\b")]
    private static partial Regex JumariRegex();

    [GeneratedRegex(@"\bwork(ed|ing|s)?\b")]
    private static partial Regex WorkRegex();

    [GeneratedRegex(@"(?:tell me about|describe|details (?:on|for)|what is)\s+(.+)$")]
    private static partial Regex DetailRegex();

    [GeneratedRegex(@"[?!.,]+$")]
    private static partial Regex TrailingPunctuationRegex();

    [GeneratedRegex(@"\s+")]
    private static partial Regex WhitespaceRegex();
}
