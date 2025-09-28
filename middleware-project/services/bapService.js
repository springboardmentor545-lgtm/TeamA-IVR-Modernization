const axios = require("axios");
const config = require("../config");
const logger = require("../utils/logger");

const getBalance = async (sessionId) => {
  try {
    const response = await axios.post(config.bapApiUrl, {
      sessionId,
      intent: "GetBalance",
    });
    return response.data;
  } catch (error) {
    logger.error("Error calling BAP service for GetBalance:", error.message);
    throw new Error("Failed to get response from BAP");
  }
};

const getMiniStatement = async (sessionId) => {
  logger.info(`Fetching mini statement from BAP for session: ${sessionId}`);
  return {
    sessionId,
    responseText:
      "Your last five transactions are: a debit of $50, a credit of $200, a debit of $25, a debit of $10, and a credit of $500.",
  };
};

const payUtilityBill = async (sessionId) => {
  logger.info(
    `Processing utility bill payment from BAP for session: ${sessionId}`
  );
  return {
    sessionId,
    responseText:
      "Please say or enter your 10-digit customer ID for your utility provider.",
  };
};

const getLoanDetails = async (sessionId) => {
  logger.info(`Fetching loan details from BAP for session: ${sessionId}`);
  return {
    sessionId,
    responseText:
      "For your personal loan, your next EMI of $350 is due on the 15th of this month. Your outstanding balance is $8,500.",
  };
};

const requestEStatement = async (sessionId) => {
  logger.info(
    `Processing e-statement request from BAP for session: ${sessionId}`
  );
  return {
    sessionId,
    responseText:
      "Your e-statement for the last 3 months has been sent to your registered email address. Please check your inbox.",
  };
};

module.exports = {
  getBalance,
  getMiniStatement,
  payUtilityBill,
  getLoanDetails,
  requestEStatement,
};
