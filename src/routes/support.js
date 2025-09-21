const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/adminMiddleware");
const postController = require("../controllers/postController");

router.post("/", authenticate, adminOnly, postController.createPost);
router.put("/:id", authenticate, adminOnly, postController.updatePost);
router.delete("/:id", authenticate, adminOnly, postController.deletePost);

router.get("/", postController.findAllPost);
router.get("/:id", postController.findPostById);
module.exports = router;
