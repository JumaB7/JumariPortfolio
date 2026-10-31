using Microsoft.EntityFrameworkCore;

namespace PortfolioAPI.Data;

public class PortfolioDbContext(DbContextOptions<PortfolioDbContext> options) : DbContext(options)
{
    public DbSet<PortfolioProfile> Profiles => Set<PortfolioProfile>();
    public DbSet<PortfolioHighlight> Highlights => Set<PortfolioHighlight>();
    public DbSet<SkillGroup> SkillGroups => Set<SkillGroup>();
    public DbSet<SkillItem> SkillItems => Set<SkillItem>();
    public DbSet<ExperienceEntry> ExperienceEntries => Set<ExperienceEntry>();
    public DbSet<ExperienceTechnology> ExperienceTechnologies => Set<ExperienceTechnology>();
    public DbSet<PortfolioProject> Projects => Set<PortfolioProject>();
    public DbSet<ProjectTechnology> ProjectTechnologies => Set<ProjectTechnology>();
    public DbSet<FinancialMonthDept> FinancialMonthDepts => Set<FinancialMonthDept>();
    public DbSet<FinancialExpense> FinancialExpenses => Set<FinancialExpense>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PortfolioProfile>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(200);
            e.Property(x => x.Role).HasMaxLength(200);
            e.Property(x => x.Location).HasMaxLength(200);
            e.Property(x => x.ContactEmail).HasMaxLength(320);
            e.Property(x => x.SourceLabel).HasMaxLength(300);
        });

        modelBuilder.Entity<PortfolioHighlight>(e =>
        {
            e.HasOne(x => x.Profile).WithMany(x => x.Highlights).HasForeignKey(x => x.ProfileId);
            e.Property(x => x.Label).HasMaxLength(120);
            e.Property(x => x.Value).HasMaxLength(400);
        });

        modelBuilder.Entity<SkillGroup>(e =>
        {
            e.Property(x => x.Title).HasMaxLength(120);
        });

        modelBuilder.Entity<SkillItem>(e =>
        {
            e.HasOne(x => x.SkillGroup).WithMany(x => x.Skills).HasForeignKey(x => x.SkillGroupId);
            e.Property(x => x.Name).HasMaxLength(120);
        });

        modelBuilder.Entity<ExperienceEntry>(e =>
        {
            e.Property(x => x.Title).HasMaxLength(240);
            e.Property(x => x.Organization).HasMaxLength(200);
            e.Property(x => x.Dates).HasMaxLength(80);
            e.Property(x => x.Location).HasMaxLength(200);
        });

        modelBuilder.Entity<ExperienceTechnology>(e =>
        {
            e.HasOne(x => x.ExperienceEntry)
                .WithMany(x => x.Technologies)
                .HasForeignKey(x => x.ExperienceEntryId);
            e.Property(x => x.Name).HasMaxLength(120);
        });

        modelBuilder.Entity<PortfolioProject>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(80);
            e.Property(x => x.Name).HasMaxLength(200);
            e.Property(x => x.Category).HasMaxLength(120);
            e.Property(x => x.Status).HasMaxLength(40);
            e.Property(x => x.StartDate).HasMaxLength(20);
            e.Property(x => x.EndDate).HasMaxLength(20);
        });

        modelBuilder.Entity<ProjectTechnology>(e =>
        {
            e.HasOne(x => x.Project).WithMany(x => x.Technologies).HasForeignKey(x => x.ProjectId);
            e.Property(x => x.Name).HasMaxLength(120);
        });

        modelBuilder.Entity<FinancialMonthDept>(e =>
        {
            e.HasIndex(x => new { x.Year, x.MonthIndex, x.Department }).IsUnique();
            e.Property(x => x.Department).HasMaxLength(80);
            e.Property(x => x.MonthKey).HasMaxLength(10);
            e.Property(x => x.MonthLabel).HasMaxLength(10);
            e.Property(x => x.Revenue).HasPrecision(18, 2);
            e.Property(x => x.PriorRevenue).HasPrecision(18, 2);
            e.Property(x => x.CashIn).HasPrecision(18, 2);
            e.Property(x => x.PriorCashIn).HasPrecision(18, 2);
            e.Property(x => x.CashOut).HasPrecision(18, 2);
            e.Property(x => x.PriorCashOut).HasPrecision(18, 2);
        });

        modelBuilder.Entity<FinancialExpense>(e =>
        {
            e.HasOne(x => x.MonthDept)
                .WithMany(x => x.Expenses)
                .HasForeignKey(x => x.FinancialMonthDeptId);
            e.Property(x => x.Category).HasMaxLength(80);
            e.Property(x => x.Actual).HasPrecision(18, 2);
            e.Property(x => x.Budget).HasPrecision(18, 2);
            e.Property(x => x.PriorActual).HasPrecision(18, 2);
            e.HasIndex(x => new { x.FinancialMonthDeptId, x.Category }).IsUnique();
        });
    }
}
