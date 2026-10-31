using Microsoft.AspNetCore.Mvc;
using PortfolioAPI.Contracts;
using PortfolioAPI.Services;

namespace PortfolioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FinancialController(FinancialContentService financial) : ControllerBase
{
    [HttpGet("analytics")]
    public async Task<ActionResult<FinancialDatasetDto>> GetAnalytics(CancellationToken ct)
    {
        var data = await financial.GetDatasetAsync(ct);
        return data is null ? NotFound() : Ok(data);
    }
}
