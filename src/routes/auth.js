const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { validateSignup } = require("../middlewares/validationMiddleware");

router.post("/email/send", authController.sendVerificationCode);
router.post("/email/verify", authController.confirmCode);
router.post("/signup", validateSignup, authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

module.exports = router;
