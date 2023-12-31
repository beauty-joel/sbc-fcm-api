const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message");

router.post("/account/single", messageController.sendToSingleAccount);
router.post("/account/group", messageController.sendToMultipleAccounts);
router.post("/topic", messageController.sendToTopic);

router.post("/native/single", messageController.sentToSingleDevice);
router.post("/native/group", messageController.sendToGroup);
router.post("/native/batch", messageController.sendBatch);

module.exports = router;
