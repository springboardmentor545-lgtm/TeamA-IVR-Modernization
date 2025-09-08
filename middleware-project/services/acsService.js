// services/acsService.js
const delay = ms => new Promise(res => setTimeout(res, ms));

module.exports = {
  async startCall(sessionId, options = {}) {
    await delay(100);
    return { success: true, sessionId, action: 'startCall', message: `Mock: Call started for ${sessionId}`, acsCallId: `ACS-${Date.now()}` };
  },

  async stopCall(sessionId) {
    await delay(80);
    return { success: true, sessionId, action: 'stopCall', message: `Mock: Call stopped for ${sessionId}` };
  },

  async sendDTMF(sessionId, dtmf) {
    await delay(60);
    return { success: true, sessionId, action: 'sendDTMF', dtmf, message: `Mock: Received DTMF '${dtmf}' for ${sessionId}` };
  }
};
