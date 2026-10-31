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
            "get_portfolio_summary" => (Summary(data), true, "Tool completed successfully"),
            "list_projects" => (ListProjects(data, Str(args, "category"), Str(args, "technology"), Str(args, "status")), true, "Tool completed successfully"),
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
            ["project_count"] = data.Projects.Count,
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
            ["dataset_label"] = data.SourceLabel,
            ["is_demo_dataset"] = true,
        };
    }

    private static Dictionary<string, object?> Experience(PortfolioAnalyticsDatasetDto data) =>
        new()
        {
            ["has_data"] = data.Experience.Count > 0,
            ["entries"] = data.Experience.Select(e => new Dictionary<string, object?>
            {
                ["title"] = e.Title,
                ["organization"] = e.Organization,
                ["dates"] = e.Dates,
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
            ["dataset_label"] = data.SourceLabel,
            ["is_demo_dataset"] = true,
        };

    private static Dictionary<string, object?> Summary(PortfolioAnalyticsDatasetDto data)
    {
        var techs = data.Projects.SelectMany(p => p.Technologies).Distinct().Count();
        var categories = data.Projects.Select(p => p.Category).Distinct().Count();
        var statuses = data.Projects
            .GroupBy(p => p.Status ?? "unknown")
            .ToDictionary(g => g.Key, g => (object?)g.Count());
        return new Dictionary<string, object?>
        {
            ["has_data"] = data.Projects.Count > 0,
            ["project_count"] = data.Projects.Count,
            ["years_experience"] = data.YearsExperience,
            ["technology_count"] = techs,
            ["category_count"] = categories,
            ["status_counts"] = statuses,
            ["dataset_label"] = data.SourceLabel,
            ["is_demo_dataset"] = true,
        };
    }

    private static Dictionary<string, object?> ListProjects(
        PortfolioAnalyticsDatasetDto data,
        string? category,
        string? technology,
        string? status)
    {
        var filtered = data.Projects.Where(p =>
        {
            if (!string.IsNullOrWhiteSpace(category) && p.Category != category) return false;
            if (!string.IsNullOrWhiteSpace(status) && p.Status != status) return false;
            if (!string.IsNullOrWhiteSpace(technology) && !p.Technologies.Contains(technology)) return false;
            return true;
        }).ToList();

        return new Dictionary<string, object?>
        {
            ["has_data"] = filtered.Count > 0,
            ["project_count"] = filtered.Count,
            ["projects"] = filtered.Select(p => new Dictionary<string, object?>
            {
                ["id"] = p.Id,
                ["name"] = p.Name,
                ["category"] = p.Category,
                ["status"] = p.Status,
                ["technologies"] = p.Technologies.ToList(),
            }).ToList(),
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
        var project = data.Projects.FirstOrDefault(p =>
            p.Id.Equals(q, StringComparison.OrdinalIgnoreCase)
            || p.Name.Equals(q, StringComparison.OrdinalIgnoreCase)
            || p.Name.Contains(q, StringComparison.OrdinalIgnoreCase));

        if (project is null)
        {
            return new Dictionary<string, object?>
            {
                ["has_data"] = false,
                ["message"] = $"No matching project for '{query}'.",
                ["dataset_label"] = data.SourceLabel,
                ["is_demo_dataset"] = true,
            };
        }

        return new Dictionary<string, object?>
        {
            ["has_data"] = true,
            ["project"] = new Dictionary<string, object?>
            {
                ["id"] = project.Id,
                ["name"] = project.Name,
                ["category"] = project.Category,
                ["status"] = project.Status,
                ["technologies"] = project.Technologies.ToList(),
                ["description"] = project.Description,
            },
            ["dataset_label"] = data.SourceLabel,
            ["is_demo_dataset"] = true,
        };
    }

    private static string? Str(IReadOnlyDictionary<string, object?> args, string key) =>
        args.TryGetValue(key, out var value) ? value?.ToString() : null;

    private static int Int(IReadOnlyDictionary<string, object?> args, string key, int fallback) =>
        args.TryGetValue(key, out var value) && int.TryParse(value?.ToString(), out var n) ? n : fallback;
}
