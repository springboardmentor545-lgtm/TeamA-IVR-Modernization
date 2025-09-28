const express = require("express");
const router = express.Router();
const ivrController = require("../controllers/ivrController");

router.post("/", async (req, res) => {
  const { sessionId, inputType, inputValue } = req.body;
  if (!sessionId || !inputType || !inputValue) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!["1", "2"].includes(String(inputValue))) {
    return res
      .status(400)
      .json({ error: 'inputValue must be "1" or "2" for this endpoint' });
  }
  try {
    const result = await ivrController.handleInput({
      sessionId,
      inputType,
      inputValue: String(inputValue),
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/conversation", ivrController.conversation);

module.exports = router;

