using Microsoft.EntityFrameworkCore;
using PortfolioAPI.Services;

namespace PortfolioAPI.Data;

/// <summary>
/// Seeds showcase portfolio + financial rows when the database is empty.
/// Safe for UAT: public demo content only (no secrets).
/// </summary>
public static class PortfolioSeed
{
    private static readonly string[] Departments = ["Engineering", "Sales", "Operations", "Marketing"];
    private static readonly string[] Categories = ["Payroll", "Operations", "Marketing", "Software & IT", "Other"];
    private static readonly string[] MonthLabels =
        ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    public static void Apply(PortfolioDbContext db)
    {
        if (!db.Profiles.Any())
        {
            SeedPortfolio(db);
        }
        else
        {
            // Existing DBs (UAT/local) keep profile rows; still upsert project catalogue.
            UpsertProjects(db);
        }

        if (!db.FinancialMonthDepts.Any())
        {
            SeedFinancial(db);
        }

        db.SaveChanges();
    }

    private static void SeedPortfolio(PortfolioDbContext db)
    {
        var source = PortfolioAnalyticsData.Create();
        var profile = new PortfolioProfile
        {
            Name = source.Owner.Name,
            Role = source.Owner.Role,
            Location = source.Owner.Location,
            Summary = source.Owner.Summary,
            YearsExperience = source.YearsExperience,
            ContactEmail = source.Contact.Email,
            SourceLabel = "SQL Server showcase dataset (portfolio content)",
            Highlights = source.Owner.Highlights
                .Select((h, i) => new PortfolioHighlight
                {
                    Label = h.Label,
                    Value = h.Value,
                    SortOrder = i,
                })
                .ToList(),
        };
        db.Profiles.Add(profile);

        var groupOrder = 0;
        foreach (var group in source.SkillGroups)
        {
            db.SkillGroups.Add(new SkillGroup
            {
                Title = group.Title,
                SortOrder = groupOrder++,
                Skills = group.Skills
                    .Select((s, i) => new SkillItem { Name = s, SortOrder = i })
                    .ToList(),
            });
        }

        var expOrder = 0;
        foreach (var entry in source.Experience)
        {
            db.ExperienceEntries.Add(new ExperienceEntry
            {
                Title = entry.Title,
                Organization = entry.Organization,
                Dates = entry.Dates,
                Location = entry.Location,
                Description = entry.Description,
                SortOrder = expOrder++,
                Technologies = entry.Technologies
                    .Select(t => new ExperienceTechnology { Name = t })
                    .ToList(),
            });
        }

        UpsertProjects(db, source.Projects);
    }

    private static void UpsertProjects(
        PortfolioDbContext db,
        IReadOnlyList<PortfolioAPI.Contracts.PortfolioAnalyticsProjectDto>? projects = null)
    {
        projects ??= PortfolioAnalyticsData.Create().Projects;
        var existing = db.Projects.Include(p => p.Technologies).ToDictionary(p => p.Id);
        var order = 0;
        foreach (var project in projects)
        {
            if (existing.TryGetValue(project.Id, out var row))
            {
                row.Name = project.Name;
                row.Category = project.Category;
                row.Status = project.Status;
                row.StartDate = project.StartDate;
                row.EndDate = project.EndDate;
                row.Description = project.Description;
                row.Kind = string.IsNullOrWhiteSpace(project.Kind) ? "personal" : project.Kind;
                row.Url = project.Url;
                row.Organization = project.Organization;
                row.SortOrder = order++;
                db.ProjectTechnologies.RemoveRange(row.Technologies);
                row.Technologies = project.Technologies
                    .Select(t => new ProjectTechnology { Name = t, ProjectId = row.Id })
                    .ToList();
            }
            else
            {
                db.Projects.Add(new PortfolioProject
                {
                    Id = project.Id,
                    Name = project.Name,
                    Category = project.Category,
                    Status = project.Status,
                    StartDate = project.StartDate,
                    EndDate = project.EndDate,
                    Description = project.Description,
                    Kind = string.IsNullOrWhiteSpace(project.Kind) ? "personal" : project.Kind,
                    Url = project.Url,
                    Organization = project.Organization,
                    SortOrder = order++,
                    Technologies = project.Technologies
                        .Select(t => new ProjectTechnology { Name = t })
                        .ToList(),
                });
            }
        }
    }

    private static void SeedFinancial(PortfolioDbContext db)
    {
        var deptShare = new Dictionary<string, double>
        {
            ["Engineering"] = 0.38,
            ["Sales"] = 0.3,
            ["Operations"] = 0.18,
            ["Marketing"] = 0.14,
        };
        var categoryShare = new Dictionary<string, double>
        {
            ["Payroll"] = 0.423,
            ["Operations"] = 0.186,
            ["Marketing"] = 0.145,
            ["Software & IT"] = 0.128,
            ["Other"] = 0.118,
        };
        var budgetFactor = new Dictionary<string, double>
        {
            ["Payroll"] = 1.04,
            ["Operations"] = 0.97,
            ["Marketing"] = 1.08,
            ["Software & IT"] = 0.94,
            ["Other"] = 1.02,
        };

        for (var m = 0; m < 12; m++)
        {
            var season = 1 + 0.08 * Math.Sin(((m - 1) / 12.0) * Math.PI * 2);
            var growth = 1 + m * 0.018;
            var companyRevenue = RoundToThousand(340_000 * season * growth);
            var companyExpenses = RoundToThousand((double)companyRevenue * (0.72 - m * 0.004));
            var companyCashIn = RoundToThousand((double)companyRevenue * (0.92 + Hash01(m + 3) * 0.06));
            var companyCashOut = RoundToThousand((double)companyExpenses * (0.94 + Hash01(m + 9) * 0.05));

            foreach (var department in Departments)
            {
                var share = deptShare[department];
                var jitter = 0.94 + Hash01(m * 17 + department.Length * 5) * 0.12;
                var revenue = RoundToThousand((double)companyRevenue * share * jitter);
                var priorRevenue = RoundToThousand((double)revenue * (0.86 + Hash01(m + 21) * 0.06));
                var cashIn = RoundToThousand((double)companyCashIn * share * jitter);
                var priorCashIn = RoundToThousand((double)cashIn * 0.88);
                var cashOut = RoundToThousand((double)companyCashOut * share * (0.96 + Hash01(m + 33) * 0.08));
                var priorCashOut = RoundToThousand((double)cashOut * 0.9);
                var deptExpensePool = RoundToThousand((double)companyExpenses * share * jitter);

                var row = new FinancialMonthDept
                {
                    Year = 2026,
                    MonthIndex = m,
                    MonthKey = $"2026-{(m + 1):D2}",
                    MonthLabel = MonthLabels[m],
                    Department = department,
                    Revenue = revenue,
                    PriorRevenue = priorRevenue,
                    CashIn = cashIn,
                    PriorCashIn = priorCashIn,
                    CashOut = cashOut,
                    PriorCashOut = priorCashOut,
                    Expenses = Categories.Select(category =>
                    {
                        var actual = RoundToThousand(
                            (double)deptExpensePool
                            * categoryShare[category]
                            * (0.95 + Hash01(m * 7 + category.Length) * 0.1));
                        return new FinancialExpense
                        {
                            Category = category,
                            Actual = actual,
                            Budget = RoundToThousand((double)actual * budgetFactor[category]),
                            PriorActual = RoundToThousand((double)actual * (0.87 + Hash01(m + category.Length) * 0.05)),
                        };
                    }).ToList(),
                };
                db.FinancialMonthDepts.Add(row);
            }
        }
    }

    private static decimal RoundToThousand(double value) =>
        Math.Round((decimal)value / 1000m) * 1000m;

    private static double Hash01(int seed)
    {
        var x = Math.Sin(seed * 12.9898) * 43758.5453;
        return x - Math.Floor(x);
    }
}
