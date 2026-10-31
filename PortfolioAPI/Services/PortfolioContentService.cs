using Microsoft.EntityFrameworkCore;
using PortfolioAPI.Contracts;
using PortfolioAPI.Data;

namespace PortfolioAPI.Services;

public class PortfolioContentService(PortfolioDbContext db)
{
    public async Task<PortfolioAnalyticsDatasetDto?> GetAnalyticsAsync(CancellationToken ct = default)
    {
        var profile = await db.Profiles
            .AsNoTracking()
            .Include(p => p.Highlights.OrderBy(h => h.SortOrder))
            .FirstOrDefaultAsync(ct);
        if (profile is null)
        {
            return null;
        }

        var skillGroups = await db.SkillGroups
            .AsNoTracking()
            .Include(g => g.Skills.OrderBy(s => s.SortOrder))
            .OrderBy(g => g.SortOrder)
            .ToListAsync(ct);

        var experience = await db.ExperienceEntries
            .AsNoTracking()
            .Include(e => e.Technologies)
            .OrderBy(e => e.SortOrder)
            .ToListAsync(ct);

        var projects = await db.Projects
            .AsNoTracking()
            .Include(p => p.Technologies)
            .OrderBy(p => p.SortOrder)
            .ToListAsync(ct);

        return new PortfolioAnalyticsDatasetDto(
            profile.SourceLabel,
            DateTime.UtcNow.ToString("O"),
            profile.YearsExperience,
            new PortfolioOwnerDto(
                profile.Name,
                profile.Role,
                profile.Location,
                profile.Summary,
                profile.Highlights
                    .OrderBy(h => h.SortOrder)
                    .Select(h => new PortfolioOwnerHighlightDto(h.Label, h.Value))
                    .ToList()),
            new PortfolioContactDto(profile.ContactEmail),
            skillGroups
                .Select(g => new PortfolioSkillGroupDto(
                    g.Title,
                    g.Skills.OrderBy(s => s.SortOrder).Select(s => s.Name).ToList()))
                .ToList(),
            experience
                .Select(e => new PortfolioExperienceDto(
                    e.Title,
                    e.Organization,
                    e.Dates,
                    e.Location,
                    e.Description,
                    e.Technologies.Select(t => t.Name).ToList()))
                .ToList(),
            projects
                .Select(p => new PortfolioAnalyticsProjectDto(
                    p.Id,
                    p.Name,
                    p.Category,
                    p.Technologies.Select(t => t.Name).ToList(),
                    p.Status,
                    p.StartDate,
                    p.EndDate,
                    p.Description))
                .ToList());
    }
}
