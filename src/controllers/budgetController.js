const models = require("../models");
const budgetService = require("../services/budgetService");

// 예산 설정
const addBudgets = async (req, res) => {
  const userId = req.user.id;
  const ledgerId = parseInt(req.params.ledgerId, 10);
  const { year, month, limit_amount } = req.body;
  const categoryId = parseInt(req.body.categoryId, 10);

  try {
    const result = await budgetService.addBudgets(
      userId,
      ledgerId,
      year,
      month,
      limit_amount,
      categoryId
    );

    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "예산을 설정하지 못했습니다.";
    res.status(status).json(message);
  }
};

// 예산 목록 조회
const getBudgets = async (req, res) => {
  const userId = req.user.id;
  const ledgerId = req.params.ledgerId;

  try {
    const result = await budgetService.getBudgets(userId, ledgerId);
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "예산 목록을 가져오지 못했습니다.";
    res.status(status).json(message);
  }
};

// 예산 상세 조회
const findBudget = async (req, res) => {
  const userId = req.user.id;
  const { ledgerId, budgetId } = req.params;

  try {
    const result = await budgetService.findBudget(userId, ledgerId, budgetId);
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "해당 예산 정보를 가져오지 못했습니다.";
    res.status(status).json(message);
  }
};

// 예산 수정
const updateBudget = async (req, res) => {
  const userId = req.user.id;
  const { ledgerId, budgetId } = req.params;
  const { year, month, limit_amount, categoryId } = req.body;

  try {
    const result = await budgetService.updateBudget(
      userId,
      ledgerId,
      budgetId,
      categoryId,
      year,
      month,
      limit_amount
    );
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "예산을 수정하지 못했습니다.";
    res.status(status).json(message);
  }
};

// 예산 삭제
const deleteBudget = async (req, res) => {
  const userId = req.user.id;
  const { ledgerId, budgetId } = req.params;

  try {
    const result = await budgetService.deleteBudget(userId, ledgerId, budgetId);
    res.status(result.status).json({ message: result.message });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "예산을 설정하지 못했습니다.";
    res.status(status).json(message);
  }
};

module.exports = {
  addBudgets,
  getBudgets,
  findBudget,
  updateBudget,
  deleteBudget,
};
