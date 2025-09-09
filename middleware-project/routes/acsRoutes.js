const express = require("express");
const router = express.Router();
const acsController = require("../controllers/acsController");

router.post("/start", (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }
  const response = acsController.startCall(sessionId);
  return res.json(response);
});

router.post("/stop", (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }
  const response = acsController.stopCall(sessionId);
  return res.json(response);
});

router.post("/sendDTMF", (req, res) => {
  const { sessionId, digit } = req.body;
  if (!sessionId || !digit) {
    return res.status(400).json({ error: "sessionId and digit are required" });
  }
  const response = acsController.sendDTMF(sessionId, digit);
  return res.json(response);
});

module.exports = router;
