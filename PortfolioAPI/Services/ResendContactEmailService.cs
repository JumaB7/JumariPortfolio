using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;
using PortfolioAPI.Contracts;

namespace PortfolioAPI.Services;

public sealed class ResendContactEmailService(
    HttpClient http,
    IOptions<ContactEmailOptions> options,
    ILogger<ResendContactEmailService> logger) : IContactEmailService
{
    private readonly ContactEmailOptions _options = options.Value;

    public async Task SendAsync(ContactRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ResendApiKey))
        {
            throw new InvalidOperationException("Contact email is not configured (missing Resend API key).");
        }

        if (string.IsNullOrWhiteSpace(_options.To) || string.IsNullOrWhiteSpace(_options.From))
        {
            throw new InvalidOperationException("Contact email is not configured (missing To/From).");
        }

        var payload = new ResendEmailRequest(
            From: _options.From.Trim(),
            To: [_options.To.Trim()],
            Subject: $"Portfolio contact from {SanitizeSubject(request.Name)}",
            Text: BuildPlainText(request),
            ReplyTo: request.Email.Trim());

        using var message = new HttpRequestMessage(HttpMethod.Post, "emails")
        {
            Content = JsonContent.Create(payload),
        };
        message.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.ResendApiKey.Trim());

        using var response = await http.SendAsync(message, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            logger.LogError(
                "Resend contact email failed with {StatusCode}: {Body}",
                (int)response.StatusCode,
                Truncate(body, 500));
            throw new InvalidOperationException("Failed to deliver contact email.");
        }

        logger.LogInformation(
            "Contact email delivered for {Name} <{Email}> ({MessageLength} chars)",
            SanitizeSubject(request.Name),
            request.Email.Trim(),
            request.Message.Length);
    }

    private static string BuildPlainText(ContactRequest request)
    {
        var sb = new StringBuilder();
        sb.AppendLine("New message from the portfolio contact form.");
        sb.AppendLine();
        sb.AppendLine($"Name: {request.Name.Trim()}");
        sb.AppendLine($"Email: {request.Email.Trim()}");
        sb.AppendLine();
        sb.AppendLine("Message:");
        sb.AppendLine(request.Message.Trim());
        return sb.ToString();
    }

    private static string SanitizeSubject(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return "Visitor";
        }

        var cleaned = value.Replace('\r', ' ').Replace('\n', ' ').Trim();
        return cleaned.Length <= 80 ? cleaned : cleaned[..80];
    }

    private static string Truncate(string value, int max)
        => value.Length <= max ? value : value[..max];

    private sealed record ResendEmailRequest(
        [property: JsonPropertyName("from")] string From,
        [property: JsonPropertyName("to")] string[] To,
        [property: JsonPropertyName("subject")] string Subject,
        [property: JsonPropertyName("text")] string Text,
        [property: JsonPropertyName("reply_to")] string ReplyTo);
}
