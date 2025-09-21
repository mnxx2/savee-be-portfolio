const models = require("../models");
const transactionService = require("../services/transactionService");

// 수입 / 지출 입력
const addTransactions = async (req, res) => {
  const { type, amount, memo, categoryId, date } = req.body;
  const ledgerId = req.params.ledgerId;
  const userId = req.user.id;

  try {
    const result = await transactionService.addTransactions(
      userId,
      ledgerId,
      categoryId,
      type,
      amount,
      memo,
      date
    );
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "수입/지출 내역을 저장하지 못헀습니다.";
    res.status(status).json(message);
  }
};

// 수입 / 지출 목록 조회
const getTransactions = async (req, res) => {
  const ledgerId = req.params.ledgerId;
  const userId = req.user.id;

  try {
    const result = await transactionService.getTransactions(userId, ledgerId);
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message =
      error.message || "수입/지출 내역 목록을 불러오지 못헀습니다.";
    res.status(status).json(message);
  }
};

// 수입 / 지출 내역 상세 조회
const findTransaction = async (req, res) => {
  const { ledgerId, transactionId } = req.params;
  const userId = req.user.id;

  try {
    const result = await transactionService.findTransaction(
      userId,
      ledgerId,
      transactionId
    );

    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "수입/지출 내역을 불러오지 못헀습니다.";
    res.status(status).json(message);
  }
};

// 수입 / 지출 내역 수정
const updateTransaction = async (req, res) => {
  const { ledgerId, transactionId } = req.params;
  const userId = req.user.id;
  const { type, amount, memo, categoryId } = req.body;

  try {
    const result = await transactionService.updateTransaction(
      userId,
      ledgerId,
      transactionId,
      categoryId,
      type,
      amount,
      memo
    );
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "수입/지출 내역을 수정하지 못했습니다.";
    res.status(status).json(message);
  }
};

// 수입 / 지출 내역 삭제
const deleteTransaction = async (req, res) => {
  const { ledgerId, transactionId } = req.params;
  const userId = req.user.id;

  try {
    const result = await transactionService.deleteTransaction(
      userId,
      ledgerId,
      transactionId
    );
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "수입/지출 내역을 삭제하지 못헀습니다.";
    res.status(status).json(message);
  }
};

// 일일 가계부 내역
const getDailyTransactions = async (req, res) => {
  const userId = req.user.id;
  const ledgerId = req.params.ledgerId;
  let month = req.query.month;

  try {
    const result = await transactionService.getDailyTransactions(
      userId,
      ledgerId,
      month
    );
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "일일 가계부를 불러오지 못했습니다.";
    res.status(status).json(message);
  }
};

const getWeeklyTransactions = async (req, res) => {
  const userId = req.user.id;
  const ledgerId = req.params.ledgerId;
  let month = req.query.month;

  try {
    const result = await transactionService.getWeeklyTransactions(
      userId,
      ledgerId,
      month
    );
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "주간 가계부를 불러오지 못했습니다.";
    res.status(status).json(message);
  }
};

const getMonthlyCalendarTransactions = async (req, res) => {
  const userId = req.user.id;
  const ledgerId = req.params.ledgerId;
  let month = req.query.month;

  try {
    const result = await transactionService.getMonthlyCalendarTransactions(
      userId,
      ledgerId,
      month
    );
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "월간 가계부를 불러오지 못했습니다.";
    res.status(status).json(message);
  }
};

const getGoalsTransactions = async (req, res) => {
  const userId = req.user.id;
  const ledgerId = req.params.ledgerId;
  const { start_date, end_date } = req.query;

  try {
    const result = await transactionService.getGoalsTransactions(
      userId,
      ledgerId,
      start_date,
      end_date
    );
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "월간 가계부를 불러오지 못했습니다.";
    res.status(status).json(message);
  }
};

module.exports = {
  addTransactions,
  getTransactions,
  findTransaction,
  updateTransaction,
  deleteTransaction,
  getDailyTransactions,
  getWeeklyTransactions,
  getMonthlyCalendarTransactions,
  getGoalsTransactions,
};
