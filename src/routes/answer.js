const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/adminMiddleware");
const answerController = require("../controllers/answerController");

router.patch(
  "/:id",
  authenticate,
  adminOnly,
  answerController.addAnswer
);
router.patch(
  "/:id/delete",
  authenticate,
  adminOnly,
  answerController.deleteAnswer
);
router.patch(
  "/:id/update",
  authenticate,
  adminOnly,
  answerController.updateAnswer
);

module.exports = router;
