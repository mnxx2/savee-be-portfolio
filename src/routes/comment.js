const express = require("express");
const router = express.Router({ mergeParams: true });
const commentController = require("../controllers/commentController");
const { authenticate } = require("../middlewares/authMiddleware");

router.post("/", authenticate, commentController.addComments);
router.get("/", authenticate, commentController.getComments);
router.get("/:commentId", authenticate, commentController.findComment);
router.put("/:commentId", authenticate, commentController.updateComment);
router.delete("/:commentId", authenticate, commentController.deleteComment);

module.exports = router;
