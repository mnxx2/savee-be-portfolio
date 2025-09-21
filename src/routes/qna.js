const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");
const qnaController = require("../controllers/qnaController");

router.post("/", authenticate, qnaController.createQna);
router.put("/:id", authenticate, qnaController.updateQna);
router.delete("/:id", authenticate, qnaController.deleteQna);

router.get("/", qnaController.findAllQna);
router.get("/search", qnaController.findBytitle);
router.get("/my", authenticate, qnaController.findMyqna);
router.get("/:id", qnaController.findByid);

module.exports = router;
