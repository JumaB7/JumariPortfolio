# JumariPortfolio

Personal portfolio site — Angular SPA + ASP.NET Core API + in-process analytics agent, one Azure App Service (Veld Supply pattern).

**Detailed integration guide** (languages, why Angular/signals/Tailwind, agent pipeline, charts, animations, deploy): see [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Stack

| Part | Choice |
| --- | --- |
| Frontend | Angular 22 + TypeScript + Tailwind 4 (`PortfolioWebApp`) |
| Backend | ASP.NET Core (.NET 10) Web API (`PortfolioAPI`) — dashboard, financial analytics, contact, **portfolio agent** |
| Database | SQL Server (LocalDB locally; Azure SQL for UAT) |
| Charts | Highcharts (heatmap, xrange, financial series) |
| Agent | In-process rule router + allowlisted SQL tools (no LLM host) |

## Run locally

Start the API first (creates/migrates LocalDB `PortfolioLocal` and seeds showcase data), then the web app.

From `PortfolioAPI`:

```powershell
dotnet run --launch-profile http
```

API: [http://localhost:5157](http://localhost:5157) · Swagger: [http://localhost:5157/swagger](http://localhost:5157/swagger)

From `PortfolioWebApp`:

```powershell
pnpm start
```

App: [http://localhost:4300](http://localhost:4300) (proxies `/api` → API).

Local connection string (Development only, committed):

`Server=(localdb)\MSSQLLocalDB;Database=PortfolioLocal;Trusted_Connection=True;TrustServerCertificate=True`

Connect in SSMS to `(localdb)\MSSQLLocalDB` → database `PortfolioLocal`.

## Agent

The analytics agent is **part of PortfolioAPI** (`POST /api/agent/chat`) — allowlisted tools over SQL-backed portfolio data. There is no separate FastAPI host in this deploy.

## Branches & deploy

| Branch | Role |
| --- | --- |
| `develop` | Day-to-day work |
| `release` | UAT deploy |
| `main` | Production (when host is ready) |

GitHub Actions (`.github/workflows/portfolio.yml`):

1. Build: `dotnet publish` API + `pnpm build` SPA  
2. On push to **`release`**: copy SPA into `api/wwwroot`, deploy to Azure App Service `JumariPortfolio`  
3. Production on `main` is a stub until `PRODUCTION_HOST` is set  

### Azure UAT checklist (same as Veld Supply)

1. Create App Service `JumariPortfolio` + Azure SQL `PortfolioUat`.  
2. App Service connection string name: **`Portfolio`**.  
3. Download publish profile → GitHub secret **`AZURE_WEBAPP_PUBLISH_PROFILE`**.  
4. Create GitHub Environment **`staging`**.  
5. Merge to **`release`** → Actions deploys UAT.  
6. Optional CORS origins for the public hostname via App Service settings.

UAT/prod connection strings stay in Azure — not in git.

## Databases by environment

| Database | Where | Used by |
| --- | --- | --- |
| `PortfolioLocal` | SQL Server LocalDB | Local development |
| `PortfolioUat` | Azure SQL | `release` → App Service |
| `PortfolioProd` | Production SQL (when ready) | `main` |
