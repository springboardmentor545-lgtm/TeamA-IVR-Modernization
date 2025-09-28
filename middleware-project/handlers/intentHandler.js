const acsService = require("../services/acsService");
const bapService = require("../services/bapService");
const logger = require("../utils/logger");

/**
 * detectIntent(query)
 * Returns an intent string based on simple keyword matching.
 * Keep it async to allow future replacement with an async NLU call.
 */
async function detectIntent(query = "") {
  if (!query || typeof query !== "string") return "UNKNOWN";
  const lowerCaseQuery = query.toLowerCase();

  // ACS intents
  if (lowerCaseQuery.includes("balance")) return "ACS_BALANCE";
  if (lowerCaseQuery.includes("recharge")) return "ACS_RECHARGE";
  if (/lost\s+(\w+\s+)?card/.test(lowerCaseQuery) ||
    lowerCaseQuery.includes("report lost") ||
    lowerCaseQuery.includes("block card") ||
    lowerCaseQuery.includes("block it")) {
  return "ACS_REPORT_LOST_CARD";
}
  if (lowerCaseQuery.includes("activate") && lowerCaseQuery.includes("card")) return "ACS_ACTIVATE_CARD";
  if (lowerCaseQuery.includes("update contact") || lowerCaseQuery.includes("change contact") || lowerCaseQuery.includes("update mobile"))
    return "ACS_UPDATE_CONTACT";
  if (lowerCaseQuery.includes("suspicious") || lowerCaseQuery.includes("fraud") || lowerCaseQuery.includes("transaction"))
    return "ACS_REPORT_SUSPICIOUS";

  // BAP intents
  if (lowerCaseQuery.includes("agent") || lowerCaseQuery.includes("representative")) return "BAP_AGENT";
  if (lowerCaseQuery.includes("mini statement")) return "BAP_GET_MINI_STATEMENT";
  if (lowerCaseQuery.includes("pay") && lowerCaseQuery.includes("bill")) return "BAP_PAY_UTILITY_BILL";
  if (lowerCaseQuery.includes("loan")) return "BAP_GET_LOAN_DETAILS";
  if (lowerCaseQuery.includes("e-statement") || lowerCaseQuery.includes("estatement")) return "BAP_REQUEST_ESTATEMENT";

  return "UNKNOWN";
}

/**
 * handleIntent(sessionId, query)
 * Routes the query to ACS or BAP mock services based on detected intent.
 * Returns a normalized object:
 *  { success: boolean, sessionId, response: string, meta?: { intent }, error?: string }
 */
async function handleIntent(sessionId, query) {
  if (!sessionId || !query) {
    return { success: false, sessionId, error: "sessionId and query are required" };
  }

  let intent;
  try {
    intent = await detectIntent(query);
    logger.info(`Detected intent '${intent}' for session ${sessionId}`);
  } catch (err) {
    logger.error(`Intent detection failed for session ${sessionId}: ${err.message}`);
    return { success: false, sessionId, error: "Intent detection failed" };
  }

  try {
    switch (intent) {
      // ---- ACS flows: use acsService.handleQuery(sessionId, query) ----
      case "ACS_BALANCE":
      case "ACS_RECHARGE":
      case "ACS_REPORT_LOST_CARD":
      case "ACS_ACTIVATE_CARD":
      case "ACS_UPDATE_CONTACT":
      case "ACS_REPORT_SUSPICIOUS": {
        // acsService.handleQuery should return { success, sessionId, data: { message } } or { success:false, error:... }
        const svc = await acsService.handleQuery(sessionId, query);
        if (!svc) {
          return { success: false, sessionId, error: "No response from ACS", meta: { intent } };
        }
        if (svc.success === false) {
          const errMsg = svc.error?.message || "ACS service error";
          return { success: false, sessionId, error: errMsg, meta: { intent } };
        }
        const message = svc.data?.message || svc.message || svc.responseText || "Action completed by ACS";
        return { success: true, sessionId, response: message, meta: { intent } };
      }

      // ---- BAP flows: call specific bapService functions ----
      case "BAP_GET_MINI_STATEMENT": {
        const svc = await bapService.getMiniStatement(sessionId);
        const message = svc?.responseText || svc?.message || "Mini statement not available";
        return { success: true, sessionId, response: message, meta: { intent } };
      }

      case "BAP_PAY_UTILITY_BILL": {
        const svc = await bapService.payUtilityBill(sessionId);
        const message = svc?.responseText || svc?.message || "Please provide bill details.";
        return { success: true, sessionId, response: message, meta: { intent } };
      }

      case "BAP_GET_LOAN_DETAILS": {
        const svc = await bapService.getLoanDetails(sessionId);
        const message = svc?.responseText || svc?.message || "Loan details not available";
        return { success: true, sessionId, response: message, meta: { intent } };
      }

      case "BAP_REQUEST_ESTATEMENT": {
        const svc = await bapService.requestEStatement(sessionId);
        const message = svc?.responseText || svc?.message || "E-statement requested";
        return { success: true, sessionId, response: message, meta: { intent } };
      }

      case "BAP_AGENT": {
        // If bapService has an agent-handoff function (e.g., handleAgentHandoff), call it.
        if (typeof bapService.handleAgentHandoff === "function") {
          const svc = await bapService.handleAgentHandoff(sessionId, query);
          const message = svc?.responseText || svc?.message || "Connecting to agent. Please hold.";
          return { success: true, sessionId, response: message, meta: { intent } };
        }
        // fallback message
        return { success: true, sessionId, response: "Connecting you to an agent. Please hold.", meta: { intent } };
      }

      // ---- Unknown ----
      default:
        return {
          success: true,
          sessionId,
          response: "Sorry, I didn't understand that. Could you rephrase?",
          meta: { intent: "UNKNOWN" },
        };
    }
  } catch (err) {
    logger.error(`Error handling intent for session ${sessionId}: ${err.message}`);
    return { success: false, sessionId, error: "Service call failed", details: err.message };
  }
}

module.exports = { detectIntent, handleIntent };
