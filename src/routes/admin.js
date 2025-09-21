const express = require("express");
const { adminOnly } = require("../middlewares/adminMiddleware");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticate } = require("../middlewares/authMiddleware");

// 모든 경로에 adminOnly 미들웨어 적용
router.use(authenticate);
router.use(adminOnly);

// 관리자 - 회원 관리
router.post("/users", adminController.createUser);
router.get("/users", adminController.getAllUsers);
router.patch("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);

module.exports = router;
