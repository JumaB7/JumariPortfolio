using PortfolioAPI.Contracts;

namespace PortfolioAPI.Services;

public interface IDashboardOverviewService
{
    Task<DashboardOverview?> GetOverviewAsync(CancellationToken ct = default);

    void Invalidate();
}
