namespace PortfolioAPI.Contracts;

public record FinancialExpenseDto(
    string Category,
    decimal Actual,
    decimal Budget,
    decimal PriorActual);

public record FinancialMonthDeptRowDto(
    int MonthIndex,
    string MonthKey,
    string MonthLabel,
    string Department,
    decimal Revenue,
    decimal PriorRevenue,
    decimal CashIn,
    decimal PriorCashIn,
    decimal CashOut,
    decimal PriorCashOut,
    IReadOnlyList<FinancialExpenseDto> Expenses);

public record FinancialDatasetDto(
    string Label,
    int Year,
    string GeneratedAt,
    IReadOnlyList<string> Departments,
    IReadOnlyList<string> Categories,
    IReadOnlyList<FinancialMonthDeptRowDto> Rows);
