const models = require("../models");
const goalService = require("../services/goalService");

// 목표 생성
const addGoals = async (req, res) => {
  const userId = req.user.id;
  const ledgerId = req.params.ledgerId;
  const {
    title,
    target_amount,
    current_amount,
    start_date,
    end_date,
    type,
    status,
    categoryId,
  } = req.body;

  try {
    const result = await goalService.addGoals(
      userId,
      ledgerId,
      categoryId,
      title,
      target_amount,
      current_amount,
      start_date,
      end_date,
      type,
      status
    );

    res
      .status(result.statusCode)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "목표를 추가하지 못헀습니다.";
    res.status(status).json({ message });
  }
};

// 목표 목록 조회
const getGoals = async (req, res) => {
  const userId = req.user.id;
  const ledgerId = req.params.ledgerId;

  try {
    const result = await goalService.getGoals(userId, ledgerId);
    res
      .status(result.statusCode)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "목표 리스트를 불러오지 못헀습니다.";
    res.status(status).json({ message });
  }
};

// 목표 상세 조회
const findGoal = async (req, res) => {
  const userId = req.user.id;
  const { ledgerId, goalId } = req.params;

  try {
    const result = await goalService.findGoal(userId, ledgerId, goalId);

    res
      .status(result.statusCode)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message =
      error.message || "해당 가계부에 설정한 목표를 불러오지 못헀습니다.";
    res.status(status).json({ message });
  }
};

// 목표 수정
const updateGoal = async (req, res) => {
  const userId = req.user.id;
  const { ledgerId, goalId } = req.params;
  const {
    title,
    target_amount,
    current_amount,
    start_date,
    end_date,
    type,
    status,
    categoryId,
  } = req.body;

  try {
    const result = await goalService.updateGoal(
      userId,
      ledgerId,
      goalId,
      categoryId,
      title,
      target_amount,
      current_amount,
      start_date,
      end_date,
      type,
      status
    );

    res
      .status(result.statusCode)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "목표를 수정하지 못헀습니다.";
    res.status(status).json({ message });
  }
};

// 목표 삭제
const deleteGoal = async (req, res) => {
  const userId = req.user.id;
  const { ledgerId, goalId } = req.params;

  try {
    const result = await goalService.deleteGoal(userId, ledgerId, goalId);

    res
      .status(result.statusCode)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "목표를 삭제하지 못헀습니다.";
    res.status(status).json({ message });
  }
};

module.exports = {
  addGoals,
  getGoals,
  findGoal,
  updateGoal,
  deleteGoal,
};
