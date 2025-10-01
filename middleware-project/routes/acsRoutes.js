const express = require("express");
const router = express.Router();
const acsController = require("../controllers/acsController");

<<<<<<< HEAD
router.post("/start", async (req, res) => {
=======
router.post("/start", (req, res) => {
>>>>>>> 32b3f2bde6f45b607feb5d1e28aa07052bfe0387
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }
<<<<<<< HEAD
  try {
    const response = await acsController.startCall(sessionId);
    return res.json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/stop", async (req, res) => {
=======
  const response = acsController.startCall(sessionId);
  return res.json(response);
});

router.post("/stop", (req, res) => {
>>>>>>> 32b3f2bde6f45b607feb5d1e28aa07052bfe0387
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }
<<<<<<< HEAD
  try {
    const response = await acsController.stopCall(sessionId);
    return res.json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/sendDTMF", async (req, res) => {
=======
  const response = acsController.stopCall(sessionId);
  return res.json(response);
});

router.post("/sendDTMF", (req, res) => {
>>>>>>> 32b3f2bde6f45b607feb5d1e28aa07052bfe0387
  const { sessionId, digit } = req.body;
  if (!sessionId || !digit) {
    return res.status(400).json({ error: "sessionId and digit are required" });
  }
<<<<<<< HEAD
  try {
    const response = await acsController.sendDTMF(sessionId, digit);
    return res.json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
=======
  const response = acsController.sendDTMF(sessionId, digit);
  return res.json(response);
});

module.exports = router;
>>>>>>> 32b3f2bde6f45b607feb5d1e28aa07052bfe0387
