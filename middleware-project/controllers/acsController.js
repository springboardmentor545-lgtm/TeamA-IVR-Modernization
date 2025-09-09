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

// 🔹 Controller Layer (Routes)
const router = express.Router();

// Start call
router.post("/start", (req, res) => {
  const result = acsService.startCall(req.body);
  res.json(result);
});

// Stop call
router.post("/stop", (req, res) => {
  const result = acsService.stopCall(req.body);
  res.json(result);
});

// Send DTMF
router.post("/sendDTMF", (req, res) => {
  const result = acsService.sendDTMF(req.body);
  res.json(result);
});

// Attach controller to /acs route
app.use("/acs", router);

// Start server
app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});

