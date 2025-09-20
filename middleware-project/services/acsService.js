// services/acsService.js
const delay = ms => new Promise(res => setTimeout(res, ms));

module.exports = {
  /**
   * Existing DTMF / call methods
   */
  async startCall(sessionId, options = {}) {
    await delay(100);
    return { 
      success: true, 
      sessionId, 
      action: 'startCall', 
      message: `Mock: Call started for ${sessionId}`, 
      acsCallId: `ACS-${Date.now()}` 
    };
  },

  async stopCall(sessionId) {
    await delay(80);
    return { 
      success: true, 
      sessionId, 
      action: 'stopCall', 
      message: `Mock: Call stopped for ${sessionId}` 
    };
  },

  async sendDTMF(sessionId, dtmf) {
    await delay(60);
    return { 
      success: true, 
      sessionId, 
      action: 'sendDTMF', 
      dtmf, 
      message: `Mock: Received DTMF '${dtmf}' for ${sessionId}` 
    };
  },

  /**
   * NEW: Handle conversational AI requests task 2 module 3
   */
  async handleConversation(sessionId, query) {
    await delay(50);

    const q = query.toLowerCase();

    if (q.includes("balance")) {
      return {
        success: true,
        sessionId,
        message: `Your account balance is ₹500.`
      };
    } else if (q.includes("recharge")) {
      return {
        success: true,
        sessionId,
        message: `Recharge successful for ₹100.`
      };
    } else {
      return {
        success: false,
        sessionId,
        message: `Sorry, I did not understand your request.`
      };
    }
  }
};
