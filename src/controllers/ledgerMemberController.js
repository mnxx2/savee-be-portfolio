const models = require("../models");
const ledgerMemberService = require("../services/ledgerMemberService");

// 멤버 생성은 이메일을 통해 초대 코드로 인증하므로 inviteController로 분리

// 멤버 목록 조회
const getMembers = async (req, res) => {
  const userId = req.user.id;
  const ledgerId = req.params.ledgerId;

  try {
    const result = await ledgerMemberService.getMembers(userId, ledgerId);
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message =
      error.message || "해당 가계부의 멤버 목록을 가져오지 못했습니다.";
    res.status(status).json(message);
  }
};

// 멤버 상세 조회
const findMember = async (req, res) => {
  const userId = req.user.id;
  const ledgerId = parseInt(req.params.ledgerId, 10);
  const memberId = parseInt(req.params.memberId, 10);

  try {
    const result = await ledgerMemberService.findMember(
      userId,
      ledgerId,
      memberId
    );
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "해당 멤버의 정보를 가져오지 못했습니다.";
    res.status(status).json(message);
  }
};

// 멤버 삭제
const deleteMember = async (req, res) => {
  const userId = req.user.id;
  const { ledgerId, memberId } = req.params;

  try {
    const result = await ledgerMemberService.deleteMember(
      userId,
      ledgerId,
      memberId
    );
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "해당 멤버를 삭제하지 못했습니다.";
    res.status(status).json(message);
  }
};

module.exports = {
  getMembers,
  findMember,
  deleteMember,
};
