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
                ? $"You can reach {(result.GetValueOrDefault("name") ?? "Jumari")} at {result.GetValueOrDefault("email")}"
                  + (result.GetValueOrDefault("location") is string loc && !string.IsNullOrWhiteSpace(loc)
                      ? $" (based in {loc})."
                      : ".")
                : $"No public contact email is listed in the portfolio content ({label}).",
            "get_portfolio_summary" => RenderSummary(result),
            "list_projects" => RenderList(result, label),
            "get_featured_projects" => RenderFeatured(result, label),
            "get_interview_answer" => RenderInterview(result, label),
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
        var years = result.GetValueOrDefault("years_experience") ?? 0;
        var summary = result.GetValueOrDefault("summary")?.ToString();
        var projects = result.GetValueOrDefault("project_count") ?? 0;

        var highlightBits = new List<string>();
        if (result.GetValueOrDefault("highlights") is IEnumerable<object> highlights)
        {
            foreach (var item in highlights)
            {
                if (item is not Dictionary<string, object?> h) continue;
                highlightBits.Add($"{h.GetValueOrDefault("label")}: {h.GetValueOrDefault("value")}");
            }
        }

        var head = $"{name} is a {role}{where} with ~{years} years of professional experience. ";
        var body = !string.IsNullOrWhiteSpace(summary) ? summary + " " : "";
        var marks = highlightBits.Count > 0 ? $"Highlights — {string.Join("; ", highlightBits)}. " : "";
        return head + body + marks + $"This showcase covers {projects} projects.";
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
            : $"My tech stack on the portfolio — {string.Join("; ", bits)}.";
    }

    private static string RenderExperience(Dictionary<string, object?> result, string label)
    {
        if (result.GetValueOrDefault("entries") is not IEnumerable<object> entries)
            return $"No experience entries found in the portfolio content ({label}).";

        var years = result.GetValueOrDefault("years_experience");
        var bits = new List<string>();
        foreach (var item in entries)
        {
            if (item is not Dictionary<string, object?> entry) continue;
            var techs = entry.GetValueOrDefault("technologies") is IEnumerable<object> list
                ? string.Join(", ", list)
                : "";
            var loc = entry.GetValueOrDefault("location")?.ToString();
            var where = string.IsNullOrWhiteSpace(loc) ? "" : $" · {loc}";
            bits.Add(
                $"{entry.GetValueOrDefault("title")} at {entry.GetValueOrDefault("organization")} "
                + $"({entry.GetValueOrDefault("dates")}{where}) — {entry.GetValueOrDefault("description")}"
                + (string.IsNullOrWhiteSpace(techs) ? "" : $" Tech: {techs}."));
        }

        if (bits.Count == 0)
            return $"No experience entries found in the portfolio content ({label}).";

        var intro = years is null ? "" : $"About ~{years} years of professional experience in the showcase. ";
        return intro + string.Join(" ", bits);
    }

    private static string RenderSummary(Dictionary<string, object?> result)
    {
        if (result.GetValueOrDefault("has_data") is not true)
            return "The showcase dataset has no portfolio projects to summarise.";

        var years = result.GetValueOrDefault("years_experience") ?? 0;
        var name = result.GetValueOrDefault("owner_name")?.ToString() ?? "Jumari";
        var role = result.GetValueOrDefault("owner_role")?.ToString() ?? "software engineer";
        var focus = result.GetValueOrDefault("focus")?.ToString();
        var personal = result.GetValueOrDefault("personal_project_count") ?? 0;
        var professional = result.GetValueOrDefault("professional_project_count") ?? 0;

        if (string.Equals(focus, "experience", StringComparison.OrdinalIgnoreCase))
        {
            var title = result.GetValueOrDefault("current_title")?.ToString();
            var org = result.GetValueOrDefault("current_organization")?.ToString();
            var dates = result.GetValueOrDefault("current_dates")?.ToString();
            var current = !string.IsNullOrWhiteSpace(title) && !string.IsNullOrWhiteSpace(org)
                ? $" Current showcase role: {title} at {org}"
                  + (string.IsNullOrWhiteSpace(dates) ? "." : $" ({dates}).")
                : "";
            return
                $"{name} is a {role} with ~{years} years of professional experience."
                + current
                + $" The portfolio lists {result.GetValueOrDefault("project_count") ?? 0} projects"
                + $" ({professional} professional, {personal} personal)"
                + $" across {result.GetValueOrDefault("category_count") ?? 0} categories."
                + " Ask 'Where has Jumari worked?' for the full experience entries.";
        }

        var statuses = result.GetValueOrDefault("status_counts") is Dictionary<string, object?> map
            ? string.Join(", ", map.Select(kv => $"{kv.Key}: {kv.Value}"))
            : "n/a";
        var names = result.GetValueOrDefault("project_names") is IEnumerable<object> list
            ? string.Join(", ", list)
            : "";

        return
            $"{name}'s showcase currently has "
            + $"{result.GetValueOrDefault("project_count") ?? 0} projects "
            + $"({professional} professional / {personal} personal), "
            + $"~{years} years of experience, "
            + $"{result.GetValueOrDefault("technology_count") ?? 0} distinct technologies, and "
            + $"{result.GetValueOrDefault("category_count") ?? 0} categories "
            + $"(status mix — {statuses})."
            + (string.IsNullOrWhiteSpace(names) ? "" : $" Projects: {names}.");
    }

    private static string RenderFeatured(Dictionary<string, object?> result, string label)
    {
        var reflection = result.GetValueOrDefault("reflection")?.ToString();
        if (!string.IsNullOrWhiteSpace(reflection))
            return reflection;

        return $"I don't have a best-project reflection in the showcase dataset ({label}). "
            + "Try asking about EasyEquities, CypherFuel, NWU WISL, or a personal project by name.";
    }

    private static string RenderInterview(Dictionary<string, object?> result, string label)
    {
        if (result.GetValueOrDefault("has_data") is true
            && result.GetValueOrDefault("answer")?.ToString() is { Length: > 0 } answer)
        {
            return answer;
        }

        return result.GetValueOrDefault("message")?.ToString()
            ?? $"No matching interview answer in the showcase content ({label}).";
    }

    private static string RenderList(Dictionary<string, object?> result, string label)
    {
        if (result.GetValueOrDefault("projects") is not IEnumerable<object> projects)
            return $"No projects matched those filters in the showcase dataset ({label}).";

        var rows = projects.OfType<Dictionary<string, object?>>().ToList();
        if (rows.Count == 0)
            return $"No projects matched those filters in the showcase dataset ({label}).";

        var bits = rows.Select(p =>
        {
            var kind = p.GetValueOrDefault("kind");
            var status = p.GetValueOrDefault("status");
            var desc = p.GetValueOrDefault("description")?.ToString();
            var shortDesc = string.IsNullOrWhiteSpace(desc)
                ? ""
                : " — " + (desc!.Length > 120 ? desc[..117] + "…" : desc);
            return $"{p.GetValueOrDefault("name")} ({kind}, {status}){shortDesc}";
        });

        var filter = result.GetValueOrDefault("filter_technology")?.ToString();
        var preface = string.IsNullOrWhiteSpace(filter)
            ? $"Found {result.GetValueOrDefault("project_count")} project(s)"
            : $"Found {result.GetValueOrDefault("project_count")} project(s) using {filter}";

        return $"{preface}: {string.Join("; ", bits)}.";
    }

    private static string RenderTech(Dictionary<string, object?> result, string label)
    {
        if (result.GetValueOrDefault("technologies") is not IEnumerable<object> rowsEnum)
            return $"No technology usage data in the showcase dataset ({label}).";

        var rows = rowsEnum.OfType<Dictionary<string, object?>>().Take(5).ToList();
        if (rows.Count == 0)
            return $"No technology usage data in the showcase dataset ({label}).";

        var top = rows[0];
        var rest = rows.Skip(1)
            .Select(r => $"{r.GetValueOrDefault("technology")} ({r.GetValueOrDefault("project_count")})")
            .ToList();
        var also = rest.Count == 0 ? "" : $" Also frequent: {string.Join(", ", rest)}.";
        return
            $"The most-used technology across showcase projects is {top.GetValueOrDefault("technology")} "
            + $"({top.GetValueOrDefault("project_count")} projects).{also}";
    }

    private static string RenderCategories(Dictionary<string, object?> result, string label)
    {
        if (result.GetValueOrDefault("categories") is not IEnumerable<object> rowsEnum)
            return $"No category distribution data in the showcase dataset ({label}).";

        var rows = rowsEnum.OfType<Dictionary<string, object?>>().Take(5).ToList();
        if (rows.Count == 0)
            return $"No category distribution data in the showcase dataset ({label}).";

        var bits = rows.Select(r =>
            $"{r.GetValueOrDefault("category")} ({r.GetValueOrDefault("project_count")})");
        return $"Project categories in the showcase: {string.Join(", ", bits)}.";
    }

    private static string RenderProject(Dictionary<string, object?> result, string label)
    {
        if (result.GetValueOrDefault("project") is not Dictionary<string, object?> project)
            return result.GetValueOrDefault("message")?.ToString()
                ?? $"No matching project in the showcase dataset ({label}).";

        var techs = project.GetValueOrDefault("technologies") is IEnumerable<object> list
            ? string.Join(", ", list)
            : "n/a";
        var desc = project.GetValueOrDefault("description")?.ToString();
        var org = project.GetValueOrDefault("organization")?.ToString();
        var url = project.GetValueOrDefault("url")?.ToString();
        var kind = project.GetValueOrDefault("kind");
        var status = project.GetValueOrDefault("status") ?? "n/a";
        var dates = string.Join(
            " → ",
            new[] { project.GetValueOrDefault("start_date")?.ToString(), project.GetValueOrDefault("end_date")?.ToString() }
                .Where(s => !string.IsNullOrWhiteSpace(s)));

        var parts = new List<string>
        {
            $"{project.GetValueOrDefault("name")} is a {kind} project in '{project.GetValueOrDefault("category")}' (status: {status}).",
        };
        if (!string.IsNullOrWhiteSpace(org)) parts.Add($"Organization: {org}.");
        if (!string.IsNullOrWhiteSpace(dates)) parts.Add($"Timeline: {dates}.");
        if (!string.IsNullOrWhiteSpace(desc)) parts.Add(desc!);
        parts.Add($"Technologies: {techs}.");
        if (!string.IsNullOrWhiteSpace(url)) parts.Add($"Link: {url}.");
        return string.Join(" ", parts);
    }
}
