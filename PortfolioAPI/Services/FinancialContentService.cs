using Microsoft.EntityFrameworkCore;
using PortfolioAPI.Contracts;
using PortfolioAPI.Data;

namespace PortfolioAPI.Services;

public class FinancialContentService(PortfolioDbContext db)
{
    public async Task<FinancialDatasetDto?> GetDatasetAsync(CancellationToken ct = default)
    {
        var rows = await db.FinancialMonthDepts
            .AsNoTracking()
            .Include(r => r.Expenses)
            .OrderBy(r => r.MonthIndex)
            .ThenBy(r => r.Department)
            .ToListAsync(ct);

        if (rows.Count == 0)
        {
            return null;
        }

        var year = rows[0].Year;
        var departments = rows.Select(r => r.Department).Distinct().OrderBy(d => d).ToList();
        var categories = rows
            .SelectMany(r => r.Expenses.Select(e => e.Category))
            .Distinct()
            .OrderBy(c => c)
            .ToList();

        return new FinancialDatasetDto(
            "Demo data from SQL Server — illustrative figures only (not real client finances)",
            year,
            DateTime.UtcNow.ToString("O"),
            departments,
            categories,
            rows.Select(r => new FinancialMonthDeptRowDto(
                r.MonthIndex,
                r.MonthKey,
                r.MonthLabel,
                r.Department,
                r.Revenue,
                r.PriorRevenue,
                r.CashIn,
                r.PriorCashIn,
                r.CashOut,
                r.PriorCashOut,
                r.Expenses
                    .OrderBy(e => e.Category)
                    .Select(e => new FinancialExpenseDto(e.Category, e.Actual, e.Budget, e.PriorActual))
                    .ToList())).ToList());
    }
}
