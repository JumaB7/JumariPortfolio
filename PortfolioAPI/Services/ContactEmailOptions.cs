namespace PortfolioAPI.Services;

public sealed class ContactEmailOptions
{
    public const string SectionName = "ContactEmail";

    /// <summary>Inbox that receives portfolio contact submissions.</summary>
    public string To { get; set; } = "jumablignaut@gmail.com";

    /// <summary>
    /// Verified Resend sender, e.g. <c>Portfolio &lt;contact@jumariblignaut.dev&gt;</c>.
    /// Until the domain is verified, Resend's onboarding address can be used for tests.
    /// </summary>
    public string From { get; set; } = "Portfolio <onboarding@resend.dev>";

    /// <summary>Resend API key. Set via user secrets / Azure App Settings — never commit.</summary>
    public string ResendApiKey { get; set; } = string.Empty;
}
