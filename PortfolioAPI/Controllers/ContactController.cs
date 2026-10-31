using Microsoft.AspNetCore.Mvc;
using PortfolioAPI.Contracts;

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
    public ActionResult<MessageResponse> Post([FromBody] ContactRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        _logger.LogInformation(
            "Contact message received from {Name} <{Email}>",
            request.Name,
            request.Email);

        return Ok(new MessageResponse("Message received."));
    }
}
