// controllers/acsController.js

// Mocked service layer (business logic)
function startCall(sessionId) {
  return {
    success: true,
    sessionId,
    callId: "mocked-call-123",
    message: Call started successfully (mocked) for ${sessionId}
  };
}

function stopCall(sessionId) {
  return {
    success: true,
    sessionId,
    message: Call stopped successfully (mocked) for ${sessionId}
  };
}

function sendDTMF(sessionId, digit) {
  return {
    success: true,
    sessionId,
    digit,
    message: DTMF '${digit}' sent successfully (mocked) for ${sessionId}
  };
}

// Export the functions
module.exports = { startCall, stopCall, sendDTMF };
