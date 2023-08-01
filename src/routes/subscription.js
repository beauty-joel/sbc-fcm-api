const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscription");

router.post("/", subscriptionController.subscribeToTopic);
router.delete("/", subscriptionController.unsubscribeFromTopic);

module.exports = router;
