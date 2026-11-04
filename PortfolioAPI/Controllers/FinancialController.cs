using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using PortfolioAPI.Contracts;
using PortfolioAPI.RateLimiting;
using PortfolioAPI.Services;

namespace PortfolioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting(PortfolioRateLimiting.ApiRead)]
public class FinancialController(FinancialContentService financial) : ControllerBase
{
    [HttpGet("analytics")]
    public async Task<ActionResult<FinancialDatasetDto>> GetAnalytics(CancellationToken ct)
    {
        var data = await financial.GetDatasetAsync(ct);
        return data is null ? NotFound() : Ok(data);
    }
}
