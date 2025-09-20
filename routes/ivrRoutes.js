const express = require('express');
const router = express.Router();
const ivrController = require('../controllers/ivrController');

// Existing route for DTMF inputs
router.post('/', async (req, res) => {
  const { sessionId, inputType, inputValue } = req.body;

  if (!sessionId || !inputType || !inputValue) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!['1', '2'].includes(String(inputValue))) {
    return res.status(400).json({ error: 'inputValue must be "1" or "2"' });
  }

  try {
    const result = await ivrController.handleInput({
      sessionId,
      inputType,
      inputValue: String(inputValue)
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// NEW route for conversational AI
router.post('/conversation', ivrController.handleConversation);

module.exports = router;
