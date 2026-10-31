using Microsoft.AspNetCore.Mvc;
using PortfolioAPI.Contracts;

namespace PortfolioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public HealthResponse Get() => new("ok");
}
