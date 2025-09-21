const express = require("express");
const router = express.Router({ mergeParams: true });
const goalController = require("../controllers/goalController");
const { authenticate } = require("../middlewares/authMiddleware");

router.post("/", authenticate, goalController.addGoals);
router.get("/", authenticate, goalController.getGoals);
router.get("/:goalId", authenticate, goalController.findGoal);
router.put("/:goalId", authenticate, goalController.updateGoal);
router.delete("/:goalId", authenticate, goalController.deleteGoal);

module.exports = router;
