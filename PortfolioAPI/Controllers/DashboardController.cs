using Microsoft.AspNetCore.Mvc;
using PortfolioAPI.Contracts;
using PortfolioAPI.Services;

namespace PortfolioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    /// <summary>Legacy overview used by older clients.</summary>
    [HttpGet]
    public DashboardOverview Get() =>
        PortfolioAnalyticsData.ToOverview(PortfolioAnalyticsData.Create());

    /// <summary>
    /// Full analytics dataset shared by the Highcharts dashboard and AI agent.
    /// </summary>
    [HttpGet("analytics")]
    public PortfolioAnalyticsDatasetDto GetAnalytics() => PortfolioAnalyticsData.Create();
}
