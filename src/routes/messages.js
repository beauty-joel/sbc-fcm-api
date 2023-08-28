const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message");

router.post("/account/single", messageController.sendToSingleAccount);

router.post("/native/single", messageController.sentToSingleDevice);

module.exports = router;
