module.exports = {
  // Existing BAP API configuration - use mock if not available
  bapApiUrl: process.env.BAP_API_URL || null, // Set to null to use mock data
  
  // New logging and server configuration
  LOG_FILE: process.env.LOG_FILE || './logs/middleware.log',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  PORT: process.env.PORT || 3000,
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Feature flags
  USE_BAP_MOCK: process.env.USE_BAP_MOCK || true
};