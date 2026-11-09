using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using PortfolioAPI.Contracts;
using PortfolioAPI.RateLimiting;
using PortfolioAPI.Services;

namespace PortfolioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly IContactEmailService _email;
    private readonly ILogger<ContactController> _logger;

    public ContactController(IContactEmailService email, ILogger<ContactController> logger)
    {
        _email = email;
        _logger = logger;
    }

    [HttpPost]
    [EnableRateLimiting(PortfolioRateLimiting.Contact)]
    public async Task<ActionResult<MessageResponse>> Post(
        [FromBody] ContactRequest request,
        CancellationToken cancellationToken)
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

        try
        {
            await _email.SendAsync(request, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Contact email delivery failed");
            return StatusCode(
                StatusCodes.Status502BadGateway,
                new MessageResponse("Could not deliver the message right now."));
        }

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
