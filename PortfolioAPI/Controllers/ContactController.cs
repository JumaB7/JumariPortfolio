using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using PortfolioAPI.Contracts;
using PortfolioAPI.RateLimiting;

namespace PortfolioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly ILogger<ContactController> _logger;

    public ContactController(ILogger<ContactController> logger)
    {
        _logger = logger;
    }

    [HttpPost]
    [EnableRateLimiting(PortfolioRateLimiting.Contact)]
    public ActionResult<MessageResponse> Post([FromBody] ContactRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        // Log identity only — never the message body (spam/XSS noise in logs).
        _logger.LogInformation(
            "Contact message received from {Name} <{Email}> ({MessageLength} chars)",
            SanitizeForLog(request.Name),
            SanitizeForLog(request.Email),
            request.Message.Length);

        return Ok(new MessageResponse("Message received."));
    }

    private static string SanitizeForLog(string value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return string.Empty;
        }

        var buffer = new StringBuilder(value.Length);
        foreach (var ch in value)
        {
            if (!char.IsControl(ch))
            {
                buffer.Append(ch);
            }
        }

        return buffer.ToString().Trim();
    }
}
