using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using PortfolioAPI.Contracts;
using PortfolioAPI.RateLimiting;
using PortfolioAPI.Services;

namespace PortfolioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting(PortfolioRateLimiting.ApiRead)]
public class DashboardController(PortfolioContentService content) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<DashboardOverview>> Get(CancellationToken ct)
    {
        var data = await content.GetAnalyticsAsync(ct);
        return data is null ? NotFound() : Ok(PortfolioAnalyticsData.ToOverview(data));
    }

    [HttpGet("analytics")]
    public async Task<ActionResult<PortfolioAnalyticsDatasetDto>> GetAnalytics(CancellationToken ct)
    {
        var data = await content.GetAnalyticsAsync(ct);
        return data is null ? NotFound() : Ok(data);
    }
}
