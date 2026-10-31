using System.ComponentModel.DataAnnotations;

namespace PortfolioAPI.Contracts;

public class ContactRequest
{
    [Required, MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(10), MaxLength(4000)]
    public string Message { get; set; } = string.Empty;
}

public record MessageResponse(string Message);
