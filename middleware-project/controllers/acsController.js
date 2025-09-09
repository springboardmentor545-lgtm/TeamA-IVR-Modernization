const acsService = require("../services/acsService");

module.exports = {
  startCall: (sessionId) => {
    return acsService.startCall(sessionId);
  },
  stopCall: (sessionId) => {
    return acsService.stopCall(sessionId);
  },
  sendDTMF: (sessionId, digit) => {
    return acsService.sendDTMF(sessionId, digit);
  }
};