const express = require("express");
const router = express.Router();
const ivrController = require("../controllers/ivrController");
const { validate, schemas } = require("../middlewares/validateFields");

// Use "/input" instead of "/"
router.post("/input", validate(schemas.ivrInput), ivrController.handleInput);
router.post("/conversation", ivrController.conversation);
router.post("/conversation-i18n", ivrController.conversationI18n);

module.exports = router;