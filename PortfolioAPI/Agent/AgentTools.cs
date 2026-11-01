using PortfolioAPI.Contracts;
using PortfolioAPI.Services;

namespace PortfolioAPI.Agent;

/// <summary>Allowlisted analytics tools over the SQL-backed portfolio dataset.</summary>
public class AgentTools(PortfolioContentService content)
{
    public async Task<(Dictionary<string, object?> Result, bool Ok, string Detail)> ExecuteAsync(
        string toolName,
        IReadOnlyDictionary<string, object?> args,
        CancellationToken ct = default)
    {
        var data = await content.GetAnalyticsAsync(ct);
        if (data is null)
        {
            return (new Dictionary<string, object?> { ["has_data"] = false }, false, "Dataset unavailable");
        }

        return toolName switch
        {
            "get_owner_profile" => (OwnerProfile(data), true, "Tool completed successfully"),
            "get_skills" => (Skills(data, Str(args, "group")), true, "Tool completed successfully"),
            "get_experience" => (Experience(data), true, "Tool completed successfully"),
            "get_contact" => (Contact(data), true, "Tool completed successfully"),
            "get_portfolio_summary" => (Summary(data, Str(args, "focus")), true, "Tool completed successfully"),
            "list_projects" => (ListProjects(data, Str(args, "category"), Str(args, "technology"), Str(args, "status"), Str(args, "kind")), true, "Tool completed successfully"),
            "get_featured_projects" => (FeaturedProjects(data), true, "Tool completed successfully"),
            "get_interview_answer" => (InterviewAnswer(Str(args, "topic") ?? ""), true, "Tool completed successfully"),
            "get_technology_usage" => (TechnologyUsage(data, Int(args, "top_n", 10)), true, "Tool completed successfully"),
            "get_category_distribution" => (CategoryDistribution(data, Int(args, "top_n", 10)), true, "Tool completed successfully"),
            "get_project_detail" => (ProjectDetail(data, Str(args, "query") ?? ""), true, "Tool completed successfully"),
            _ => (new Dictionary<string, object?>(), false, $"Tool '{toolName}' is not allowlisted"),
        };
    }

    private static Dictionary<string, object?> OwnerProfile(PortfolioAnalyticsDatasetDto data) =>
        new()
        {
            ["has_data"] = true,
            ["name"] = data.Owner.Name,
            ["role"] = data.Owner.Role,
            ["location"] = data.Owner.Location,
            ["summary"] = data.Owner.Summary,
            ["years_experience"] = data.YearsExperience,
            ["highlights"] = data.Owner.Highlights
                .Select(h => new Dictionary<string, object?> { ["label"] = h.Label, ["value"] = h.Value })
                .ToList(),
            ["top_skills"] = data.SkillGroups
                .SelectMany(g => g.Skills)
                .Distinct()
                .Take(12)
                .ToList(),
            ["project_count"] = data.Projects.Count,
            ["project_names"] = data.Projects.Select(p => p.Name).ToList(),
            ["dataset_label"] = data.SourceLabel,
            ["is_demo_dataset"] = true,
        };

    private static Dictionary<string, object?> Skills(PortfolioAnalyticsDatasetDto data, string? group)
    {
        var groups = data.SkillGroups
            .Where(g => string.IsNullOrWhiteSpace(group) || g.Title.Equals(group, StringComparison.OrdinalIgnoreCase))
            .Select(g => new Dictionary<string, object?>
            {
                ["title"] = g.Title,
                ["skills"] = g.Skills.ToList(),
            })
            .ToList();
        return new Dictionary<string, object?>
        {
            ["has_data"] = groups.Count > 0,
            ["groups"] = groups,
            ["flat_skills"] = groups
                .SelectMany(g => g.GetValueOrDefault("skills") as IEnumerable<object> ?? [])
                .Select(s => s.ToString())
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .ToList(),
            ["dataset_label"] = data.SourceLabel,
            ["is_demo_dataset"] = true,
        };
    }

    private static Dictionary<string, object?> Experience(PortfolioAnalyticsDatasetDto data) =>
        new()
        {
            ["has_data"] = data.Experience.Count > 0,
            ["years_experience"] = data.YearsExperience,
            ["entries"] = data.Experience.Select(e => new Dictionary<string, object?>
            {
                ["title"] = e.Title,
                ["organization"] = e.Organization,
                ["dates"] = e.Dates,
                ["location"] = e.Location,
                ["description"] = e.Description,
                ["technologies"] = e.Technologies.ToList(),
            }).ToList(),
            ["dataset_label"] = data.SourceLabel,
            ["is_demo_dataset"] = true,
        };

    private static Dictionary<string, object?> Contact(PortfolioAnalyticsDatasetDto data) =>
        new()
        {
            ["has_data"] = !string.IsNullOrWhiteSpace(data.Contact.Email),
            ["email"] = data.Contact.Email,
            ["name"] = data.Owner.Name,
            ["location"] = data.Owner.Location,
            ["dataset_label"] = data.SourceLabel,
            ["is_demo_dataset"] = true,
        };

    private static Dictionary<string, object?> Summary(PortfolioAnalyticsDatasetDto data, string? focus)
    {
        var techs = data.Projects.SelectMany(p => p.Technologies).Distinct().OrderBy(t => t).ToList();
        var categories = data.Projects.Select(p => p.Category).Distinct().OrderBy(c => c).ToList();
        var statuses = data.Projects
            .GroupBy(p => p.Status ?? "unknown")
            .ToDictionary(g => g.Key, g => (object?)g.Count());
        var currentRole = data.Experience.FirstOrDefault();
        var personal = data.Projects.Count(p => p.Kind == "personal");
        var professional = data.Projects.Count(p => p.Kind == "professional");
        return new Dictionary<string, object?>
        {
            ["has_data"] = data.Projects.Count > 0 || data.YearsExperience > 0,
            ["focus"] = focus,
            ["owner_name"] = data.Owner.Name,
            ["owner_role"] = data.Owner.Role,
            ["owner_summary"] = data.Owner.Summary,
            ["owner_location"] = data.Owner.Location,
            ["current_title"] = currentRole?.Title,
            ["current_organization"] = currentRole?.Organization,
            ["current_dates"] = currentRole?.Dates,
            ["project_count"] = data.Projects.Count,
            ["personal_project_count"] = personal,
            ["professional_project_count"] = professional,
            ["years_experience"] = data.YearsExperience,
            ["technology_count"] = techs.Count,
            ["technologies"] = techs,
            ["category_count"] = categories.Count,
            ["categories"] = categories,
            ["status_counts"] = statuses,
            ["project_names"] = data.Projects.Select(p => p.Name).ToList(),
            ["dataset_label"] = data.SourceLabel,
            ["is_demo_dataset"] = true,
        };
    }

    private static Dictionary<string, object?> FeaturedProjects(PortfolioAnalyticsDatasetDto data)
    {
        var named = new[] { "EasyEquities", "CypherFuel", "NWU WISL" };
        var matched = data.Projects
            .Where(p => named.Any(n =>
                p.Name.Contains(n, StringComparison.OrdinalIgnoreCase)
                || (p.Organization?.Contains(n, StringComparison.OrdinalIgnoreCase) ?? false)))
            .Select(p => p.Name)
            .Distinct()
            .ToList();

        var personal = data.Projects
            .Where(p => string.Equals(p.Kind, "personal", StringComparison.OrdinalIgnoreCase))
            .Select(p => p.Name)
            .ToList();

        return new Dictionary<string, object?>
        {
            ["has_data"] = true,
            ["reflection"] = PortfolioAnalyticsData.BestProjectReflection,
            ["mentioned_projects"] = matched,
            ["personal_projects"] = personal,
            ["dataset_label"] = data.SourceLabel,
            ["is_demo_dataset"] = true,
        };
    }

    private static Dictionary<string, object?> InterviewAnswer(string topic)
    {
        if (PortfolioAnalyticsData.InterviewAnswers.TryGetValue(topic, out var answer))
        {
            return new Dictionary<string, object?>
            {
                ["has_data"] = true,
                ["topic"] = topic,
                ["answer"] = answer,
                ["dataset_label"] = "portfolio interview reflections",
                ["is_demo_dataset"] = true,
            };
        }

        return new Dictionary<string, object?>
        {
            ["has_data"] = false,
            ["topic"] = topic,
            ["message"] = $"No interview answer configured for '{topic}'.",
            ["dataset_label"] = "portfolio interview reflections",
            ["is_demo_dataset"] = true,
        };
    }

    private static Dictionary<string, object?> ListProjects(
        PortfolioAnalyticsDatasetDto data,
        string? category,
        string? technology,
        string? status,
        string? kind)
    {
        var filtered = data.Projects.Where(p =>
        {
            if (!string.IsNullOrWhiteSpace(category) && !p.Category.Contains(category, StringComparison.OrdinalIgnoreCase))
                return false;
            if (!string.IsNullOrWhiteSpace(status) && !string.Equals(p.Status, status, StringComparison.OrdinalIgnoreCase))
                return false;
            if (!string.IsNullOrWhiteSpace(kind) && !string.Equals(p.Kind, kind, StringComparison.OrdinalIgnoreCase))
                return false;
            if (!string.IsNullOrWhiteSpace(technology)
                && !p.Technologies.Any(t => t.Contains(technology, StringComparison.OrdinalIgnoreCase)))
                return false;
            return true;
        }).ToList();

        return new Dictionary<string, object?>
        {
            ["has_data"] = filtered.Count > 0,
            ["project_count"] = filtered.Count,
            ["filter_technology"] = technology,
            ["filter_category"] = category,
            ["filter_status"] = status,
            ["filter_kind"] = kind,
            ["projects"] = filtered.Select(ProjectCard).ToList(),
            ["dataset_label"] = data.SourceLabel,
            ["is_demo_dataset"] = true,
        };
    }

    private static Dictionary<string, object?> TechnologyUsage(PortfolioAnalyticsDatasetDto data, int topN)
    {
        var rows = data.Projects
            .SelectMany(p => p.Technologies)
            .GroupBy(t => t)
            .Select(g => new { technology = g.Key, project_count = g.Count() })
            .OrderByDescending(x => x.project_count)
            .ThenBy(x => x.technology)
            .Take(Math.Clamp(topN, 1, 50))
            .Select((x, i) => new Dictionary<string, object?>
            {
                ["rank"] = i + 1,
                ["technology"] = x.technology,
                ["project_count"] = x.project_count,
            })
            .ToList();

        return new Dictionary<string, object?>
        {
            ["has_data"] = rows.Count > 0,
            ["technologies"] = rows,
            ["dataset_label"] = data.SourceLabel,
            ["is_demo_dataset"] = true,
        };
    }

    private static Dictionary<string, object?> CategoryDistribution(PortfolioAnalyticsDatasetDto data, int topN)
    {
        var rows = data.Projects
            .GroupBy(p => p.Category)
            .Select(g => new { category = g.Key, project_count = g.Count() })
            .OrderByDescending(x => x.project_count)
            .ThenBy(x => x.category)
            .Take(Math.Clamp(topN, 1, 50))
            .Select(x => new Dictionary<string, object?>
            {
                ["category"] = x.category,
                ["project_count"] = x.project_count,
            })
            .ToList();

        return new Dictionary<string, object?>
        {
            ["has_data"] = rows.Count > 0,
            ["categories"] = rows,
            ["dataset_label"] = data.SourceLabel,
            ["is_demo_dataset"] = true,
        };
    }

    private static Dictionary<string, object?> ProjectDetail(PortfolioAnalyticsDatasetDto data, string query)
    {
        var q = query.Trim();
        var resolvedId = ResolveProjectId(q);
        var project = data.Projects.FirstOrDefault(p =>
            (!string.IsNullOrWhiteSpace(resolvedId) && p.Id.Equals(resolvedId, StringComparison.OrdinalIgnoreCase))
            || p.Id.Equals(q, StringComparison.OrdinalIgnoreCase)
            || p.Name.Equals(q, StringComparison.OrdinalIgnoreCase)
            || p.Name.Contains(q, StringComparison.OrdinalIgnoreCase)
            || (p.Organization?.Contains(q, StringComparison.OrdinalIgnoreCase) ?? false));

        if (project is null)
        {
            return new Dictionary<string, object?>
            {
                ["has_data"] = false,
                ["message"] = $"No matching project for '{query}'. Try EasyEquities, CypherFuel, NWU WISL, Veld Supply, or Accountant App.",
                ["dataset_label"] = data.SourceLabel,
                ["is_demo_dataset"] = true,
            };
        }

        return new Dictionary<string, object?>
        {
            ["has_data"] = true,
            ["project"] = ProjectCard(project),
            ["dataset_label"] = data.SourceLabel,
            ["is_demo_dataset"] = true,
        };
    }

    private static Dictionary<string, object?> ProjectCard(PortfolioAnalyticsProjectDto project) =>
        new()
        {
            ["id"] = project.Id,
            ["name"] = project.Name,
            ["category"] = project.Category,
            ["status"] = project.Status,
            ["kind"] = project.Kind,
            ["start_date"] = project.StartDate,
            ["end_date"] = project.EndDate,
            ["url"] = project.Url,
            ["organization"] = project.Organization,
            ["description"] = project.Description,
            ["technologies"] = project.Technologies.ToList(),
        };

    private static string? ResolveProjectId(string query)
    {
        if (PortfolioAnalyticsData.ProjectAliases.TryGetValue(query, out var id))
            return id;

        foreach (var (alias, projectId) in PortfolioAnalyticsData.ProjectAliases
                     .OrderByDescending(kv => kv.Key.Length))
        {
            if (query.Contains(alias, StringComparison.OrdinalIgnoreCase))
                return projectId;
        }

        return null;
    }

    private static string? Str(IReadOnlyDictionary<string, object?> args, string key) =>
        args.TryGetValue(key, out var value) ? value?.ToString() : null;

    private static int Int(IReadOnlyDictionary<string, object?> args, string key, int fallback) =>
        args.TryGetValue(key, out var value) && int.TryParse(value?.ToString(), out var n) ? n : fallback;
}
