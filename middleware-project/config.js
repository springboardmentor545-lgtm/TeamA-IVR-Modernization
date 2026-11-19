// Load .env if present. Loaded here rather than in index.js because this
// module reads process.env at require time and is pulled in by the logger
// before index.js finishes its own requires. Variables already set in the
// real environment win, so a platform's injected config is never overridden
// by a stray .env file.
// quiet: suppress dotenv's own startup banner, which would otherwise be the
// first thing in the logs on every boot.
require('dotenv').config({ quiet: true });

module.exports = {
  // Existing BAP API configuration - use mock if not available
  bapApiUrl: process.env.BAP_API_URL || null, // Set to null to use mock data
  
  // New logging and server configuration
  LOG_FILE: process.env.LOG_FILE || './logs/middleware.log',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  PORT: process.env.PORT || 3000,
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Comma-separated origins allowed to call the API cross-origin, e.g.
  // "https://ivr.example.com,https://admin.example.com". Empty means
  // same-origin only, which is all the bundled UI needs since this app serves
  // it. In development, localhost origins are additionally allowed so a
  // separate frontend dev server works without extra configuration.
  CORS_ORIGINS: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean),
  
  // Feature flags
  // Forces mock BAP responses even when BAP_API_URL is set. Without a URL the
  // service falls back to mocks regardless, so this only matters once one is
  // configured. Compared against the string 'true' because every env var is a
  // string — `process.env.X || true` is always truthy and can never be unset.
  USE_BAP_MOCK: process.env.USE_BAP_MOCK === 'true'
};