namespace PortfolioAPI.Agent;

public static class AgentAnswers
{
    public static string? Render(string toolName, Dictionary<string, object?> result)
    {
        var label = result.GetValueOrDefault("dataset_label")?.ToString() ?? "showcase portfolio data";

        return toolName switch
        {
            "get_owner_profile" => RenderOwner(result, label),
            "get_skills" => RenderSkills(result, label),
            "get_experience" => RenderExperience(result, label),
            "get_contact" => result.GetValueOrDefault("has_data") is true
                ? $"You can reach Jumari at {result.GetValueOrDefault("email")}."
                : $"No public contact email is listed in the portfolio content ({label}).",
            "get_portfolio_summary" => RenderSummary(result),
            "list_projects" => RenderList(result, label),
            "get_technology_usage" => RenderTech(result, label),
            "get_category_distribution" => RenderCategories(result, label),
            "get_project_detail" => RenderProject(result, label),
            _ => null,
        };
    }

    private static string RenderOwner(Dictionary<string, object?> result, string label)
    {
        if (result.GetValueOrDefault("has_data") is not true)
            return "The showcase dataset has no owner profile to share.";

        var name = result.GetValueOrDefault("name")?.ToString() ?? "The portfolio owner";
        var role = result.GetValueOrDefault("role")?.ToString() ?? "software engineer";
        var location = result.GetValueOrDefault("location")?.ToString() ?? "";
        var where = string.IsNullOrWhiteSpace(location) ? "" : $" based in {location}";
        var projects = result.GetValueOrDefault("project_count") ?? 0;
        return $"{name} is a {role}{where}. This showcase covers {projects} of their projects. (Showcase data: {label}.)";
    }

    private static string RenderSkills(Dictionary<string, object?> result, string label)
    {
        if (result.GetValueOrDefault("groups") is not IEnumerable<object> groups)
            return $"No matching skills found in the portfolio content ({label}).";

        var bits = new List<string>();
        foreach (var item in groups)
        {
            if (item is not Dictionary<string, object?> group) continue;
            var title = group.GetValueOrDefault("title");
            var skills = group.GetValueOrDefault("skills") is IEnumerable<object> list
                ? string.Join(", ", list)
                : "";
            bits.Add($"{title}: {skills}");
        }

        return bits.Count == 0
            ? $"No matching skills found in the portfolio content ({label})."
            : $"Skills on the portfolio — {string.Join("; ", bits)}.";
    }

    private static string RenderExperience(Dictionary<string, object?> result, string label)
    {
        if (result.GetValueOrDefault("entries") is not IEnumerable<object> entries)
            return $"No experience entries found in the portfolio content ({label}).";

        var bits = new List<string>();
        foreach (var item in entries)
        {
            if (item is not Dictionary<string, object?> entry) continue;
            bits.Add(
                $"{entry.GetValueOrDefault("title")} at {entry.GetValueOrDefault("organization")} "
                + $"({entry.GetValueOrDefault("dates")}) — {entry.GetValueOrDefault("description")}");
        }

        return bits.Count == 0
            ? $"No experience entries found in the portfolio content ({label})."
            : string.Join(" ", bits);
    }

    private static string RenderSummary(Dictionary<string, object?> result)
    {
        if (result.GetValueOrDefault("has_data") is not true)
            return "The showcase dataset has no portfolio projects to summarise.";

        var statuses = result.GetValueOrDefault("status_counts") is Dictionary<string, object?> map
            ? string.Join(", ", map.Select(kv => $"{kv.Key}: {kv.Value}"))
            : "n/a";

        return
            "This portfolio currently showcases "
            + $"{result.GetValueOrDefault("project_count") ?? 0} projects, "
            + $"~{result.GetValueOrDefault("years_experience") ?? 0} years of experience, "
            + $"{result.GetValueOrDefault("technology_count") ?? 0} distinct project technologies, and "
            + $"{result.GetValueOrDefault("category_count") ?? 0} categories "
            + $"(status mix — {statuses}).";
    }

    private static string RenderList(Dictionary<string, object?> result, string label)
    {
        if (result.GetValueOrDefault("projects") is not IEnumerable<object> projects)
            return $"No projects matched those filters in the showcase dataset ({label}).";

        var names = projects
            .OfType<Dictionary<string, object?>>()
            .Select(p => p.GetValueOrDefault("name")?.ToString())
            .Where(n => !string.IsNullOrWhiteSpace(n));
        var joined = string.Join(", ", names);
        return string.IsNullOrWhiteSpace(joined)
            ? $"No projects matched those filters in the showcase dataset ({label})."
            : $"Found {result.GetValueOrDefault("project_count")} project(s): {joined}. Source: {label}.";
    }

    private static string RenderTech(Dictionary<string, object?> result, string label)
    {
        if (result.GetValueOrDefault("technologies") is not IEnumerable<object> rows
            || rows.OfType<Dictionary<string, object?>>().FirstOrDefault() is not { } top)
            return $"No technology usage data in the showcase dataset ({label}).";

        return
            $"The most-used technology is {top.GetValueOrDefault("technology")} "
            + $"({top.GetValueOrDefault("project_count")} projects). Source: {label}.";
    }

    private static string RenderCategories(Dictionary<string, object?> result, string label)
    {
        if (result.GetValueOrDefault("categories") is not IEnumerable<object> rows
            || rows.OfType<Dictionary<string, object?>>().FirstOrDefault() is not { } top)
            return $"No category distribution data in the showcase dataset ({label}).";

        return
            $"The largest category is {top.GetValueOrDefault("category")} "
            + $"({top.GetValueOrDefault("project_count")} projects). Source: {label}.";
    }

    private static string RenderProject(Dictionary<string, object?> result, string label)
    {
        if (result.GetValueOrDefault("project") is not Dictionary<string, object?> project)
            return result.GetValueOrDefault("message")?.ToString()
                ?? $"No matching project in the showcase dataset ({label}).";

        var techs = project.GetValueOrDefault("technologies") is IEnumerable<object> list
            ? string.Join(", ", list)
            : "n/a";
        return
            $"{project.GetValueOrDefault("name")} is in '{project.GetValueOrDefault("category")}' "
            + $"(status: {project.GetValueOrDefault("status") ?? "n/a"}) and uses {techs}. Source: {label}.";
    }
}
