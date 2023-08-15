const express = require("express");
const router = express.Router();
const tokenController = require("../controllers/token");

router.post("/", tokenController.saveToken);
// router.delete("/", tokenController.deleteToken);

module.exports = router;
