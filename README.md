# JumariPortfolio

Personal portfolio site.

## Stack

| Part | Choice |
| --- | --- |
| Frontend | Angular (`PortfolioWebApp`) |
| Backend | ASP.NET Core Web API, C# (`PortfolioAPI`) |

## Run locally

Start the API first, then the web app. The Angular dev server proxies `/api` to the API.

From `PortfolioAPI`:

```powershell
dotnet run --launch-profile http
```

The API is [http://localhost:5157](http://localhost:5157). Swagger is [http://localhost:5157/swagger](http://localhost:5157/swagger). In Visual Studio, open `JumariPortfolio.slnx` (or `PortfolioAPI/PortfolioAPI.csproj`) and use the **http** profile.

From `PortfolioWebApp`:

```powershell
pnpm start
```

The app is [http://localhost:4200](http://localhost:4200).

## Branches

`main` is production. `develop` is active work. `release` is for release candidates.
