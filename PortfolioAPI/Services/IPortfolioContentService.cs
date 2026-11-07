using PortfolioAPI.Contracts;

namespace PortfolioAPI.Services;

public interface IPortfolioContentService
{
    Task<PortfolioAnalyticsDatasetDto?> GetAnalyticsAsync(CancellationToken ct = default);
}
