const express = require("express");
const router = express.Router();
const acsController = require("../controllers/acsController");

router.post("/start", async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }
  try {
    const response = await acsController.startCall(sessionId);
    return res.json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/stop", async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }
  try {
    const response = await acsController.stopCall(sessionId);
    return res.json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/sendDTMF", async (req, res) => {
  const { sessionId, digit } = req.body;
  if (!sessionId || !digit) {
    return res.status(400).json({ error: "sessionId and digit are required" });
  }
  try {
    const response = await acsController.sendDTMF(sessionId, digit);
    return res.json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
