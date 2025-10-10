const express = require("express");
const router = express.Router();
const acsController = require("../controllers/acsController");
const { validate, schemas } = require("../middlewares/validateFields");

// Apply validation to all routes using schemas from validateFields
router.post("/start", validate(schemas.acsStart), acsController.startCall);
router.post("/stop", validate(schemas.acsStop), acsController.stopCall);
router.post("/sendDTMF", validate(schemas.acsSendDTMF), acsController.sendDTMF);

module.exports = router;