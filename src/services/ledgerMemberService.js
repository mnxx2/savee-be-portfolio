const models = require("../models");

// 멤버 목록 조회
const getMembers = async (userId, ledgerId) => {
  try {
    const { success, status, message } = await validateUserAndLedger(
      userId,
      ledgerId
    );
    if (!success) return { status, message };

    const members = await models.LedgerMember.findAll({
      where: { ledgerId },
      include: [
        { model: models.User, as: "user_ledgermembers", attributes: ["name"] },
      ],
    });

    return {
      status: 200,
      message: "해당 가계부에 참여하고 있는 멤버 리스트를 가져왔습니다.",
      data: members,
    };
  } catch (error) {
    throw error;
  }
};

// 멤버 상세 조회
const findMember = async (userId, ledgerId, memberId) => {
  try {
    const { success, status, message } = await validateUserAndLedger(
      userId,
      ledgerId,
      memberId
    );
    if (!success) return { status, message };

    const member = await models.LedgerMember.findOne({
      where: { ledgerId, id: memberId },
      include: [
        { model: models.User, as: "user_ledgermembers", attributes: ["name"] },
      ],
    });

    return {
      status: 200,
      message: "해당 멤버의 정보를 가져왔습니다.",
      data: member,
    };
  } catch (error) {
    throw error;
  }
};

// 멤버 삭제
const deleteMember = async (userId, ledgerId, memberId) => {
  try {
    const { success, status, message } = await validateUserAndLedger(
      userId,
      ledgerId,
      memberId
    );

    if (!success) return { status, message };

    const member = await models.LedgerMember.findByPk(memberId);

    if (userId === member.userId) {
      return { status: 404, message: "자기 자신은 삭제할 수 없습니다." };
    }

    await models.LedgerMember.destroy({
      where: { userId: memberId, ledgerId },
    });

    return { status: 200, message: "해당 멤버를 삭제했습니다." };
  } catch (error) {
    throw error;
  }
};

const validateUserAndLedger = async (userId, ledgerId, memberId) => {
  const user = await models.User.findByPk(userId);

  // 로그인한 사용자가 맞는지 권한 검증
  if (!user) {
    return {
      success: false,
      status: 404,
      message: "사용자 정보를 확인할 수 없습니다.",
    };
  }

  // 해당 가계부가 맞는지 권한 검증
  const ledger = await models.Ledger.findByPk(ledgerId);

  if (!ledger) {
    return {
      success: false,
      status: 404,
      message: "해당 가계부를 찾을 수 없습니다.",
    };
  }

  // 공유 가계부가 맞는지 검증
  if (!ledger.is_shared) {
    return { success: false, status: 404, message: "공유 가계부가 아닙니다." };
  }

  // 둘 중 하나라도 권한이 없으면 가계부에 접근 못 하도록 설정
  const isMember = await models.LedgerMember.findOne({
    where: { ledgerId, userId },
  });
  if (!isMember) {
    return {
      success: false,
      status: 404,
      message: "가계부에 접근할 권한이 없습니다.",
    };
  }

  // 사용자가 onwer가 맞는지 확인
  if (isMember.role !== "owner") {
    return {
      success: false,
      status: 404,
      message: "해당 가계부의 소유자가 아닙니다.",
    };
  }

  // 해당 멤버가 가계부에 속하는지 확인
  if (memberId) {
    const member = await models.LedgerMember.findByPk(memberId);
    if (!member) {
      return {
        success: false,
        status: 404,
        message: "존재하지 않는 멤버입니다.",
      };
    }

    if (member.ledgerId !== Number(ledgerId)) {
      return {
        success: false,
        status: 404,
        message: "해당 멤버는 이 가계부에 속하지 않습니다.",
      };
    }
  }

  return { success: true, status: 200, user, ledger };
};

module.exports = {
  getMembers,
  findMember,
  deleteMember,
};
