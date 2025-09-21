const models = require("../models");
const ledgerService = require("../services/ledgerService");

// 가계부 생성
const createLedger = async (req, res) => {
  const { name, is_shared } = req.body;
  const userId = req.user.id;

  try {
    const result = await ledgerService.createLedger(name, is_shared, userId);
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "가계부를 만드는 중 문제가 발생했습니다.";
    res.status(status).json({ error: message });
  }
};

// 가계부 정보 수정
const updateLedger = async (req, res) => {
  const { name } = req.body;
  const ledgerId = req.params.ledgerId;
  const userId = req.user.id;

  try {
    const result = await ledgerService.updateLedger(userId, name, ledgerId);
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "가계부 정보를 수정하지 못했습니다.";
    res.status(status).json({ error: message });
  }
};

// 가계부 목록 조회
const getLedgers = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await ledgerService.getLedgers(userId);
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "가계부 목록을 가져오지 못했습니다.";
    res.status(status).json({ error: message });
  }
};

// 가계부 삭제
const deleteLedger = async (req, res) => {
  const userId = req.user.id;
  const ledgerId = req.params.ledgerId;

  try {
    const result = await ledgerService.deleteLedger(userId, ledgerId);
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "가계부를 삭제하지 못했습니다.";
    res.status(status).json({ error: message });
  }
};

// 가계부 상세 조회
const findLedger = async (req, res) => {
  const userId = req.user.id;
  const ledgerId = req.params.ledgerId;

  try {
    const result = await ledgerService.findLedger(userId, ledgerId);
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "가계부의 정보를 불러오지 못했습니다.";
    res.status(status).json({ error: message });
  }
};

// 개인 가계부 ledgerId 가져오기
const getPersonalLedger = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await ledgerService.getPersonalLedger(userId);
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "개인 가계부를 불러오지 못했습니다.";
    res.status(status).json({ error: message });
  }
};

// 가계부 멤버가 자신이 참여한 공유 가계부의 목록 조회
const getSharedLedgersByMembership = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await ledgerService.getSharedLedgersByMembership(userId);
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message =
      error.message || "참여중인 공유 가계부 목록을 불러오지 못했습니다.";
    res.status(status).json({ error: message });
  }
};

// 개인 가계부 + 참여중인 공유 가계부 모두 조회
const getAllAccessLedgers = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await ledgerService.getAllAccessLedgers(userId);
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message =
      error.message ||
      "현재 소유하거나 참여중인 가계부 목록을 불러오지 못했습니다.";
    res.status(status).json({ error: message });
  }
};

module.exports = {
  createLedger,
  updateLedger,
  getLedgers,
  deleteLedger,
  findLedger,
  getPersonalLedger,
  getSharedLedgersByMembership,
  getAllAccessLedgers,
};
