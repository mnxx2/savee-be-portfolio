const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const {
  authenticate,
  checkBlacklist,
} = require("../middlewares/authMiddleware");

router.put(
  "/password",
  authenticate,
  checkBlacklist,
  userController.changePassword
);
router.put("/name", authenticate, checkBlacklist, userController.changeName);

router.post("/password/send", userController.sendPasswordResetEmail);
router.post("/password/reset", userController.findPassword);
router.post("/", authenticate, checkBlacklist, userController.deleteUser);
router.get("/me", authenticate, checkBlacklist, userController.getUserInfo);

module.exports = router;
