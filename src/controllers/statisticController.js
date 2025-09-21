const models = require("../models");
const statisticService = require("../services/statisticService");

const getCategoryExpensing = async (req, res) => {
  try {
    const userId = req.user.id;
    const ledgerId = req.personalLedger.id;
    const type = req.query.type;
    const result = await statisticService.getCategoryExpensing({
      userId,
      ledgerId,
      type,
    });
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    const message =
      error.message || "카테고리별 지출 조회 중 오류가 발생했습니다.";
    res.status(status).json({ error: message });
  }
};

const getMonthlyTotalExpensing = async (req, res) => {
  try {
    const userId = req.user.id;
    const ledgerId = req.personalLedger.id;
    const result = await statisticService.getMonthlyTotalExpensing(
      userId,
      ledgerId
    );
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    const message =
      error.message || "월간 지출 총합 조회 중 오류가 발생했습니다.";
    res.status(status).json({ error: message });
  }
};

const getWeeklyTotalExpensing = async (req, res) => {
  try {
    const userId = req.user.id;
    const ledgerId = req.personalLedger.id;
    const result = await statisticService.getWeeklyTotalExpensing(
      userId,
      ledgerId
    );
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    const message =
      error.message || "주간 지출 총합 조회 중 오류가 발생했습니다.";
    res.status(status).json({ error: message });
  }
};

const getLast7DaysExpensing = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await statisticService.getLast7DaysExpensing(userId);
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    const message =
      error.message || "최근 7일간 일일 추이 조회 중 오류가 발생했습니다.";
    res.status(status).json({ error: message });
  }
};

// 카테고리별 지출 내역 조회
const getGroupedExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const ledgerId = req.personalLedger.id;
    const type = req.query.type;

    const result = await statisticService.getGroupedExpenses({
      userId,
      ledgerId,
      type,
    });
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    const message =
      error.message || "카테고리별 지출 내역 조회 중 오류가 발생했습니다.";
    res.status(status).json({ error: message });
  }
};

// 월간 지출 내역 조회
const getMonthlyExpensesList = async (req, res) => {
  try {
    const userId = req.user.id;
    const ledgerId = req.personalLedger.id;
    const { year, month } = req.params;
    const y = Number(year);
    const m = Number(month);

    if (!y || !m || m < 1 || m > 12) {
      return res
        .status(400)
        .json({ message: "올바른 연도와 월을 입력하세요." });
    }
    const expenses = await statisticService.getMonthlyExpensesList(
      userId,
      ledgerId,
      y,
      m
    );
    res.status(200).json({ expenses });
  } catch (error) {
    const status = error.status || 500;
    const message =
      error.message || "월별 지출 내역 조회 중 오류가 발생했습니다.";
    res.status(status).json({ error: message });
  }
};

// 주간 지출 내역 조회
const getWeeklyExpensesList = async (req, res) => {
  try {
    const userId = req.user.id;
    const ledgerId = req.personalLedger.id;

    const weeklyExpenses = await statisticService.getWeeklyExpensesList(
      userId,
      ledgerId
    );
    res.status(200).json({ weeklyExpenses });
  } catch (error) {
    const status = error.status || 500;
    const message =
      error.message || "주별 지출 내역 조회 중 오류가 발생했습니다.";
    res.status(status).json({ error: message });
  }
};

// 카테고리별 통계 데이터 적용
// const updateCategoryStats = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const ledgerId = req.personalLedger.id;
//     const type = req.query.type;
//     if (!["weekly", "monthly"].includes(type)) {
//       return res
//         .status(400)
//         .json({ error: "타입은 'weekly' 또는 'monthly'만 가능합니다." });
//     }
//     const result = await statisticService.updateCategoryStats({
//       userId,
//       ledgerId,
//       type,
//     });
//     res.status(200).json({ message: "통계 데이터 갱신 완료", data: result });
//   } catch (error) {
//     const status = error.status || 500;
//     const message =
//       error.message || "카테고리 별 통계 데이터 처리 중 오류가 발생했습니다.";
//     res.status(status).json({ error: message });
//   }
// };

module.exports = {
  getCategoryExpensing,
  getMonthlyTotalExpensing,
  getWeeklyTotalExpensing,
  getLast7DaysExpensing,
  getGroupedExpenses,
  getMonthlyExpensesList,
  getWeeklyExpensesList,
  // updateCategoryStats,
};
