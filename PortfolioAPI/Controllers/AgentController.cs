using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using PortfolioAPI.Agent;
using PortfolioAPI.Contracts;
using PortfolioAPI.RateLimiting;

namespace PortfolioAPI.Controllers;

[ApiController]
[Route("api/agent")]
public class AgentController(AgentOrchestrator orchestrator) : ControllerBase
{
    [HttpPost("chat")]
    [EnableRateLimiting(PortfolioRateLimiting.Agent)]
    public async Task<ActionResult<AgentChatResponse>> Chat(
        [FromBody] AgentChatRequest request,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Message) || request.Message.Length > 4000)
        {
            return BadRequest(new { detail = "Message is required (max 4000 characters)." });
        }

        var response = await orchestrator.RunAsync(request.Message, ct);
        return Ok(response);
    }
}
