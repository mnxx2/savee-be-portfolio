const express = require("express");
const router = express.Router();
const inviteController = require("../controllers/inviteController");
const { authenticate } = require("../middlewares/authMiddleware");

router.post("/accept/:code", authenticate, inviteController.acceptInvite);

module.exports = router;
