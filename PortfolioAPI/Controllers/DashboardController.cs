using Microsoft.AspNetCore.Mvc;
using PortfolioAPI.Contracts;
using PortfolioAPI.Services;

namespace PortfolioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
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
