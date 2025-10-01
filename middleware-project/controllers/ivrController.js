<<<<<<< HEAD
const bapService = require("../services/bapService");
const acsService = require("../services/acsService");

module.exports = {
  /**
   * Handle IVR inputs and decide which service to call
   * @param {Object} payload - { sessionId, inputType, inputValue }
   */
  async handleInput({ sessionId, inputType, inputValue }) {
    try {
      
      inputValue = String(inputValue);

      
      if (inputValue === "1") {
        const result = await bapService.handleInput(sessionId, inputType, inputValue);
        return {
          sessionId,
          responseText: result.responseText
        };
      }

      
      if (inputValue === "2") {
        const result = await bapService.handleInput(sessionId, inputType, inputValue);
        return {
          sessionId,
          responseText: result.responseText
        };
      }

      
      return {
        sessionId,
        responseText: "Invalid input. Please try again."
      };
    } catch (err) {
      console.error("Error in IVR Controller:", err);
      return {
        sessionId,
        responseText: "Internal server error. Please try again later."
      };
    }
  }
};
=======
const bapService = require("../services/bapService");
const acsService = require("../services/acsService");
const { handleIntent } = require("../handlers/intentHandler");

module.exports = {
  /**
   * Handle DTMF inputs (1 or 2)
   */
  async handleInput({ sessionId, inputType, inputValue }) {
    try {
      inputValue = String(inputValue);

      if (inputValue === "1") {
        // Directly get balance from BAP service
        const result = await bapService.getBalance(sessionId);
        return {
          sessionId,
          responseText:
            result.responseText || "Your balance is not available right now.",
        };
      }

      if (inputValue === "2") {
        // Start ACS call
        const result = await acsService.startCall(sessionId);
        return {
          sessionId,
          responseText: result.message || "Call started.",
        };
      }

      return {
        sessionId,
        responseText: "Invalid input. Please try again.",
      };
    } catch (err) {
      console.error("Error in IVR Controller:", err);
      return {
        sessionId,
        responseText: "Internal server error. Please try again later.",
      };
    }
  },

  /**
   * Handle free-text conversation queries
   */
  async conversation(req, res) {
    const { sessionId, query } = req.body;

    if (!sessionId || !query) {
      return res.status(400).json({
        success: false,
        error: "sessionId and query are required",
      });
    }

    try {
      const result = await handleIntent(sessionId, query);

      if (!result || result.success === false) {
        return res.json({
          sessionId,
          response:
            result?.response ||
            result?.error ||
            "Sorry, an error occurred while processing your request.",
        });
      }

      return res.json({
        sessionId,
        response: result.response,
      });
    } catch (err) {
      console.error("Error in /ivr/conversation:", err.message);
      return res
        .status(500)
        .json({ success: false, error: "Internal server error" });
    }
  },
};
>>>>>>> 32b3f2bde6f45b607feb5d1e28aa07052bfe0387
