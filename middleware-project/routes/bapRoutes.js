// routes/bapRoutes.js
const express = require('express');
const router = express.Router();
const bapController = require('../controllers/bapController');
const { validate, schemas } = require('../middlewares/validateFields'); // Fixed import

router.post('/process', validate(schemas.bapProcess), bapController.process);

module.exports = router;