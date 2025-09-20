const bapService = require("../services/bapService");
const acsService = require("../services/acsService");
const detectIntent = require("../utils/detectIntent"); // we'll create this file

module.exports = {
  /**
   * Handle DTMF IVR inputs
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
        const result = await acsService.startCall(sessionId);
        return {
          sessionId,
          responseText: result.message
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
  },

  /**
   * Handle conversational AI queries
   */
  async handleConversation(req, res) {
    try {
      const { sessionId, query } = req.body;
      if (!sessionId || !query) {
        return res.status(400).json({ error: "Missing sessionId or query" });
      }

      const intent = detectIntent(query); // uses our keyword matcher
      let responseMessage = "";

      if (intent === "ACS") {
        const result = await acsService.handleConversation(sessionId, query);
        responseMessage = result.message;
      } else if (intent === "BAP") {
        const result = await bapService.handleConversation(sessionId, query);
        responseMessage = result.message;
      } else {
        responseMessage = "Sorry, I did not understand that.";
      }

      return res.json({ sessionId, response: responseMessage });
    } catch (err) {
      console.error("Error in handleConversation:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};
