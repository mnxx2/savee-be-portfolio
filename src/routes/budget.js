const express = require("express");
const router = express.Router({ mergeParams: true });
const budgetController = require("../controllers/budgetController");
const { authenticate } = require("../middlewares/authMiddleware");

router.post("/", authenticate, budgetController.addBudgets);
router.get("/", authenticate, budgetController.getBudgets);
router.get("/:budgetId", authenticate, budgetController.findBudget);
router.put("/:budgetId", authenticate, budgetController.updateBudget);
router.delete("/:budgetId", authenticate, budgetController.deleteBudget);

module.exports = router;
