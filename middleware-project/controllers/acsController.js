// app.js
const express = require("express");
const app = express();
// 🔹 Service Layer (Mocked)
const acsService = {
  startCall: () => {
    return {
      callId: "mocked-call-123",
      message: "Call started successfully (mocked)"
    };
  }
};
// 🔹 Controller Layer
const router = express.Router();
router.post("/start", (req, res) => {
  const result = acsService.startCall();
  res.json(result); // return mocked response
});
// Attach controller to /acs route
app.use("/acs", router);
// Start server
app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
