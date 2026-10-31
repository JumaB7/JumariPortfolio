export const environment = {
  production: false,
  apiBaseUrl: '/api',
  /** Dev proxy: /agent-api → FastAPI http://127.0.0.1:8000/api (avoid clashing with /api → PortfolioAPI) */
  agentApiBaseUrl: '/agent-api',
  email: 'jumablignaut@gmail.com',
  linkedInUrl: '',
  githubUrl: '',
  cvUrl: '/cv/Jumari_Blignaut_CV_2026.pdf',
  projects: {
    veldSupplyUrl: 'https://veld-supply-cpdddtaqf8epdpe0.southafricanorth-01.azurewebsites.net',
    accountantAdminUrl: '',
    accountantMobileUrl: '',
  },
};
