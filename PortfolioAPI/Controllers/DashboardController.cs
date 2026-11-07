using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using PortfolioAPI.Contracts;
using PortfolioAPI.RateLimiting;
using PortfolioAPI.Services;

namespace PortfolioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting(PortfolioRateLimiting.ApiRead)]
public class DashboardController(
    IDashboardOverviewService overview,
    IPortfolioContentService content) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<DashboardOverview>> Get(CancellationToken ct)
    {
        var data = await overview.GetOverviewAsync(ct);
        return data is null ? NotFound() : Ok(data);
    }

    [HttpGet("analytics")]
    public async Task<ActionResult<PortfolioAnalyticsDatasetDto>> GetAnalytics(CancellationToken ct)
    {
        var data = await content.GetAnalyticsAsync(ct);
        return data is null ? NotFound() : Ok(data);
    }
}
