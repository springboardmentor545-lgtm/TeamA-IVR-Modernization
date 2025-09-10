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
