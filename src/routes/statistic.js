const express = require("express");
const router = express.Router();
const statisticController = require("../controllers/statisticController");
const { authenticate } = require("../middlewares/authMiddleware");
const { checkPersonalLedger } = require("../middlewares/statisticMiddleware");

router.get(
  "/categories",
  authenticate,
  checkPersonalLedger,
  statisticController.getCategoryExpensing
);

router.get(
  "/categories/expenses",
  authenticate,
  checkPersonalLedger,
  statisticController.getGroupedExpenses
);

router.get(
  "/trend/total/monthly",
  authenticate,
  checkPersonalLedger,
  statisticController.getMonthlyTotalExpensing
);

router.get(
  "/trend/total/monthly/expenses/:year/:month",
  authenticate,
  checkPersonalLedger,
  statisticController.getMonthlyExpensesList
);

router.get(
  "/trend/total/weekly",
  authenticate,
  checkPersonalLedger,
  statisticController.getWeeklyTotalExpensing
);

router.get(
  "/trend/total/weekly/expenses",
  authenticate,
  checkPersonalLedger,
  statisticController.getWeeklyExpensesList
);

router.get(
  "/trend/daily",
  authenticate,
  checkPersonalLedger,
  statisticController.getLast7DaysExpensing
);

// 카테고리별 지출 총합 데이터 업데이트 용
// router.post(
//   "/categories/stats",
//   authenticate,
//   checkPersonalLedger,
//   statisticController.updateCategoryStats
// );

module.exports = router;
