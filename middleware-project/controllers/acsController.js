const express = require("express");
const app = express();
app.use(express.json()); // to parse JSON request body

// 🔹 Service Layer (Mocked)
const acsService = {
  startCall: (data) => {
    return {
      success: true,
      callId: data?.sessionId || "mocked-call-123",
      message: "Call started successfully (mocked)"
    };
  },
  stopCall: (data) => {
    return {
      success: true,
      callId: data?.sessionId || "mocked-call-123",
      message: "Call stopped successfully (mocked)"
    };
  },
  sendDTMF: (data) => {
    return {
      success: true,
      callId: data?.sessionId || "mocked-call-123",
      tones: data?.tones || "1",
      message: "DTMF tones sent successfully (mocked)"
    };
  }
};
