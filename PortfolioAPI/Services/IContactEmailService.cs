using PortfolioAPI.Contracts;

namespace PortfolioAPI.Services;

public interface IContactEmailService
{
    Task SendAsync(ContactRequest request, CancellationToken cancellationToken = default);
}
