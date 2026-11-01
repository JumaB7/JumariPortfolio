namespace PortfolioAPI.Data;

public class PortfolioProfile
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Role { get; set; } = "";
    public string Location { get; set; } = "";
    public string Summary { get; set; } = "";
    public int YearsExperience { get; set; }
    public string ContactEmail { get; set; } = "";
    public string SourceLabel { get; set; } = "";
    public List<PortfolioHighlight> Highlights { get; set; } = [];
}

public class PortfolioHighlight
{
    public int Id { get; set; }
    public int ProfileId { get; set; }
    public PortfolioProfile Profile { get; set; } = null!;
    public string Label { get; set; } = "";
    public string Value { get; set; } = "";
    public int SortOrder { get; set; }
}

public class SkillGroup
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public int SortOrder { get; set; }
    public List<SkillItem> Skills { get; set; } = [];
}

public class SkillItem
{
    public int Id { get; set; }
    public int SkillGroupId { get; set; }
    public SkillGroup SkillGroup { get; set; } = null!;
    public string Name { get; set; } = "";
    public int SortOrder { get; set; }
}

public class ExperienceEntry
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Organization { get; set; } = "";
    public string Dates { get; set; } = "";
    public string Location { get; set; } = "";
    public string Description { get; set; } = "";
    public int SortOrder { get; set; }
    public List<ExperienceTechnology> Technologies { get; set; } = [];
}

public class ExperienceTechnology
{
    public int Id { get; set; }
    public int ExperienceEntryId { get; set; }
    public ExperienceEntry ExperienceEntry { get; set; } = null!;
    public string Name { get; set; } = "";
}

public class PortfolioProject
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Category { get; set; } = "";
    public string? Status { get; set; }
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public string? Description { get; set; }
    /// <summary>personal | professional</summary>
    public string Kind { get; set; } = "personal";
    public string? Url { get; set; }
    public string? Organization { get; set; }
    public int SortOrder { get; set; }
    public List<ProjectTechnology> Technologies { get; set; } = [];
}

public class ProjectTechnology
{
    public int Id { get; set; }
    public string ProjectId { get; set; } = "";
    public PortfolioProject Project { get; set; } = null!;
    public string Name { get; set; } = "";
}

public class FinancialMonthDept
{
    public int Id { get; set; }
    public int Year { get; set; }
    public int MonthIndex { get; set; }
    public string MonthKey { get; set; } = "";
    public string MonthLabel { get; set; } = "";
    public string Department { get; set; } = "";
    public decimal Revenue { get; set; }
    public decimal PriorRevenue { get; set; }
    public decimal CashIn { get; set; }
    public decimal PriorCashIn { get; set; }
    public decimal CashOut { get; set; }
    public decimal PriorCashOut { get; set; }
    public List<FinancialExpense> Expenses { get; set; } = [];
}

public class FinancialExpense
{
    public int Id { get; set; }
    public int FinancialMonthDeptId { get; set; }
    public FinancialMonthDept MonthDept { get; set; } = null!;
    public string Category { get; set; } = "";
    public decimal Actual { get; set; }
    public decimal Budget { get; set; }
    public decimal PriorActual { get; set; }
}
