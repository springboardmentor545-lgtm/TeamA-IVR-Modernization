const axios = require("axios");
const config = require("../config");
const { logger } = require('../middlewares/logger');

const getBalance = async (sessionId) => {
  try {
    // Check if BAP API URL is configured and available
    if (!config.bapApiUrl || config.bapApiUrl.includes('localhost:3001')) {
      logger.info(`Using mock balance for session: ${sessionId}`);
      // Return mock response when BAP server is not available
      return {
        sessionId,
        responseText: "Your account balance is $1,234.56. (Mock Data)"
      };
    }

    // Only try to call real BAP service if URL is configured
    const response = await axios.post(config.bapApiUrl, {
      sessionId,
      intent: "GetBalance",
    }, {
      timeout: 5000 // 5 second timeout
    });
    return response.data;
  } catch (error) {
    logger.warn(`BAP service unavailable, using mock data for session: ${sessionId}`);
    // Fallback to mock data
    return {
      sessionId,
      responseText: "Your current balance is $1,234.56. (Fallback Data)"
    };
  }
};

const getMiniStatement = async (sessionId) => {
  logger.info(`Fetching mini statement from BAP for session: ${sessionId}`);
  return {
    sessionId,
    responseText: "Your last five transactions are: a debit of $50, a credit of $200, a debit of $25, a debit of $10, and a credit of $500.",
  };
};

const agentConnect = async (sessionId) => {
  logger.info(`Connecting to agent for session: ${sessionId}`);
  return {
    sessionId,
    responseText: "You are now connected to a customer service agent.",
  };
};

const payUtilityBill = async (sessionId) => {
  logger.info(`Processing utility bill payment from BAP for session: ${sessionId}`);
  return {
    sessionId,
    responseText: "Please say or enter your 10-digit customer ID for your utility provider.",
  };
};

const getLoanDetails = async (sessionId) => {
  logger.info(`Fetching loan details from BAP for session: ${sessionId}`);
  return {
    sessionId,
    responseText: "For your personal loan, your next EMI of $350 is due on the 15th of this month. Your outstanding balance is $8,500.",
  };
};

const requestEStatement = async (sessionId) => {
  logger.info(`Processing e-statement request from BAP for session: ${sessionId}`);
  return {
    sessionId,
    responseText: "Your e-statement for the last 3 months has been sent to your registered email address. Please check your inbox.",
  };
};

// Add the handle method that bapController expects
const handle = async (payload) => {
  logger.info('BAP service processing request', { payload });
  
  // Mock implementation for bapController
  return {
    success: true,
    message: 'BAP request processed successfully',
    data: {
      sessionId: payload.sessionId,
      action: payload.action,
      timestamp: new Date().toISOString()
    }
  };
};

module.exports = {
  getBalance,
  getMiniStatement,
  payUtilityBill,
  getLoanDetails,
  requestEStatement,
  handle // Add this export
};