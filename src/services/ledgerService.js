const models = require("../models");

// 개인 가게부 ledgerId 가져오기
const getPersonalLedger = async (userId) => {
  try {
    const { success, status, message } = await validateUserAndLedger(userId);
    if (!success) return { status, message };

    const ledger = await models.Ledger.findOne({
      where: { userId, is_shared: false },
    });

    if (!ledger) {
      return {
        status: 404,
        message: "개인 가계부가 없습니다. ",
      };
    }

    return {
      status: 200,
      message: "개인 가계부를 불러왔습니다.",
      data: ledger,
    };
  } catch (error) {
    throw error;
  }
};

const createLedger = async (name, is_shared, userId) => {
  try {
    const { success, status, message } = await validateUserAndLedger(userId);
    if (!success) return { status, message };

    let ledger;

    if (!is_shared) {
      // 개인 가계부는 1개만 허용
      const existingPersonalLedger = await models.Ledger.findOne({
        where: { userId, is_shared: false },
      });

      if (existingPersonalLedger) {
        return {
          status: 400,
          message: "개인 가계부가 이미 존재합니다.",
        };
      }

      ledger = await models.Ledger.create({
        name,
        is_shared: false,
        userId,
      });
    } else {
      // 공유 가계부는 여러 개 가능
      ledger = await models.Ledger.create({
        name,
        is_shared: true,
        userId,
      });

      await models.LedgerMember.create({
        ledgerId: ledger.id,
        userId,
        role: "owner",
      });
    }

    return { status: 200, message: "가계부가 만들어졌습니다.", data: ledger };
  } catch (error) {
    throw error;
  }
};

const updateLedger = async (userId, name, ledgerId) => {
  try {
    const { success, status, message } = await validateUserAndLedger(
      userId,
      ledgerId
    );
    if (!success) return { status, message };

    const ledger = await models.Ledger.findOne({
      where: { id: ledgerId },
    });

    // 가계부를 소유한 사용자가 맞는지 검증 후 수정
    if (ledger.userId == userId) {
      if (ledger) {
        if (name) ledger.name = name;
      }
    } else {
      return { status: 404, message: "가계부에 접근할 권한이 없습니다." };
    }

    await ledger.save();
    return {
      status: 200,
      message: "가계부 정보를 수정했습니다.",
      data: ledger,
    };
  } catch (error) {
    throw error;
  }
};

// 공유 가계부만 가져오기
const getLedgers = async (userId) => {
  try {
    const { success, status, message } = await validateUserAndLedger(userId);
    if (!success) return { status, message };

    const ledgers = await models.Ledger.findAll({
      where: { userId },
    });

    return {
      status: 200,
      message: "가계부 목록을 가져왔습니다.",
      data: ledgers,
    };
  } catch (error) {
    throw error;
  }
};

// 공유 가계부만 삭제
const deleteLedger = async (userId, ledgerId) => {
  try {
    const { success, status, message } = await validateUserAndLedger(
      userId,
      ledgerId
    );
    if (!success) return { status, message };

    const ledger = await models.Ledger.findOne({
      where: { userId, id: ledgerId, is_shared: true },
    });

    if (ledger.userId == userId) {
      // 삭제하려는 가계부가 공유 가계부라면 멤버도 같이 삭제
      if (ledger.is_shared) {
        await models.LedgerMember.destroy({
          where: { ledgerId },
        });
      }
      await ledger.destroy();
    } else {
      return { status: 404, message: "가계부에 접근할 권한이 없습니다." };
    }

    return { status: 200, message: "가계부가 삭제되었습니다." };
  } catch (error) {
    throw error;
  }
};

const getSharedLedgersByMembership = async (userId) => {
  try {
    const { success, status, message } = await validateUserAndLedger(userId);
    if (!success) return { status, message };

    const member = await models.LedgerMember.findAll({
      where: { userId },
      include: [
        {
          model: models.Ledger,
          as: "ledger_ledgermembers",
          where: { is_shared: true },
          include: [
            { model: models.Goal, as: "ledger_goals" },
            { model: models.Budget, as: "ledger_budgets" },
            {
              model: models.LedgerMember,
              as: "ledger_ledgermembers",
              include: [
                {
                  model: models.User,
                  as: "user_ledgermembers",
                  attributes: ["id", "name", "email"],
                },
              ],
            },
          ],
        },
      ],
    });

    const ledgers = member.map((entry) => entry.ledger_ledgermembers);

    return {
      status: 200,
      message: "참여 중인 공유 가계부 목록을 가져왔습니다.",
      data: ledgers,
    };
  } catch (error) {
    throw error;
  }
};

const findLedger = async (userId, ledgerId) => {
  try {
    const { success, status, message } = await validateUserAndLedger(
      userId,
      ledgerId
    );
    if (!success) return { status, message };

    const ledger = await models.Ledger.findOne({
      where: { id: ledgerId },
      include: [
        {
          model: models.LedgerMember,
          as: "ledger_ledgermembers",
          include: [
            {
              model: models.User,
              as: "user_ledgermembers",
              attributes: ["id", "name", "email"],
            },
          ],
        },
        { model: models.Goal, as: "ledger_goals" },
        { model: models.Budget, as: "ledger_budgets" },
        {
          model: models.User,
          as: "user_ledgers",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (
      ledger.userId === userId ||
      ledger.ledger_ledgermembers?.some((m) => m.userId === userId)
    ) {
      return { status: 200, message: "가계부를 가져왔습니다.", data: ledger };
    } else {
      return { status: 404, message: "가계부에 접근할 권한이 없습니다." };
    }
  } catch (error) {
    throw error;
  }
};

const getAllAccessLedgers = async (userId) => {
  try {
    const { success, status, message } = await validateUserAndLedger(userId);
    if (!success) return { status, message };

    // 개인 및 본인이 소유한 공유 가계부
    const ownedLedgers = await models.Ledger.findAll({ where: { userId } });

    // 멤버로 참여중인 공유 가게부
    const memberLedger = await models.LedgerMember.findAll({
      where: { userId },
      include: [
        {
          model: models.Ledger,
          as: "ledger_ledgermembers",
          where: { is_shared: true },
        },
      ],
    });

    const sharedLedgers = memberLedger.map(
      (ledger) => ledger.ledger_ledgermembers
    );

    // 중복 제거 (본인이 소유 + 멤버인 경우)
    const allLedgers = new Map();
    [...ownedLedgers, ...sharedLedgers].forEach((ledger) => {
      allLedgers.set(ledger.id, ledger);
    });

    const ledgerResult = Array.from(allLedgers.values());

    return {
      status: 200,
      message: "접근 가능한 모든 가게부를 가져왔습니다.",
      data: ledgerResult,
    };
  } catch (error) {
    throw error;
  }
};

const validateUserAndLedger = async (userId, ledgerId) => {
  const user = await models.User.findByPk(userId);
  if (!user) {
    return {
      success: false,
      status: 404,
      message: "사용자 정보를 찾을 수 없습니다.",
    };
  }

  if (ledgerId) {
    if (ledgerId !== null && ledgerId !== undefined) {
      const ledger = await models.Ledger.findOne({
        where: { id: ledgerId },
        include: [{ model: models.LedgerMember, as: "ledger_ledgermembers" }],
      });

      if (!ledger) {
        return {
          success: false,
          status: 404,
          message: "가계부를 찾을 수 없습니다.",
        };
      }

      const isOwner = ledger.userId === userId;
      const isMember = ledger.ledger_ledgermembers?.some(
        (member) => member.userId === userId
      );

      if (!isOwner && !isMember) {
        return {
          success: false,
          status: 403,
          message: "가계부에 접근 권한이 없습니다.",
        };
      }
    }
  }

  return { success: true, status: 200, user };
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
