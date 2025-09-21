const models = require("../models");

// 목표 생성
const addGoals = async (
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
) => {
  try {
    // 유효한 type 값 목록 (enum으로 정의된 값들)
    const validGoalTypes = ["saving", "spending_cut", "income_increase"];

    // type 값 유효성 검사
    if (!validGoalTypes.includes(type)) {
      throw new Error(`유효하지 않은 목표 타입입니다. (${type})`);
    }

    const { success, statusCode, message } = await validateUserAndLedger(
      userId,
      ledgerId,
      categoryId
    );
    if (!success) return { statusCode, message };

    if (!current_amount) {
      current_amount = 0;
    }

    if (!start_date) {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      start_date = `${yyyy}-${mm}-${dd}`;
    }

    const isGoal = await models.Goal.findOne({
      where: { ledgerId },
    });

    if (isGoal) {
      return {
        success: false,
        statusCode: 404,
        message: "이미 해당 가계부에 목표가 설정되어 있습니다.",
      };
    }

    const goal = await models.Goal.create({
      userId,
      ledgerId,
      categoryId,
      title,
      target_amount,
      current_amount,
      start_date,
      end_date,
      type,
      status,
    });

    const result = await models.Goal.findByPk(goal.id, {
      include: [
        {
          model: models.Category,
          as: "category_goals",
          attributes: ["name"],
        },
      ],
    });

    return {
      statusCode: 200,
      message: `${result.category_goals.name} 카테고리에 목표가 설정되었습니다.`,
      data: result,
    };
  } catch (error) {
    throw error;
  }
};

// 목표 목록 조회
const getGoals = async (userId, ledgerId) => {
  try {
    const { success, statusCode, message } = await validateUserAndLedger(
      userId,
      ledgerId
    );
    if (!success) return { statusCode, message };

    const goals = await models.Goal.findAll({
      where: { ledgerId },
      include: [
        {
          model: models.Category,
          as: "category_goals",
          attributes: ["name"],
        },
      ],
    });

    return {
      statusCode: 200,
      message: "해당 가계부에 설정되어 있는 예산을 가져왔습니다.",
      data: goals,
    };
  } catch (error) {
    throw error;
  }
};

// 목표 상세 조회
const findGoal = async (userId, ledgerId, goalId) => {
  try {
    const { success, statusCode, message } = await validateUserAndLedger(
      userId,
      ledgerId,
      goalId
    );
    if (!success) return { statusCode, message };

    const goal = await models.Goal.findOne({
      where: { ledgerId, id: goalId },
      include: [
        {
          model: models.Category,
          as: "category_goals",
          attributes: ["name"],
        },
      ],
    });

    return {
      statusCode: 200,
      message: `${goal.category_goals.name} 카테고리의 목표를 가져왔습니다.`,
      data: goal,
    };
  } catch (error) {
    throw error;
  }
};

// 목표 수정
const updateGoal = async (
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
) => {
  try {
    if (type === undefined) {
      console.log("type이 전달되지 않았습니다. 다른 값들만 수정됩니다.");
    }

    // 유효한 type 값 목록 (enum으로 정의된 값들)
    const validGoalTypes = ["saving", "spending_cut", "income_increase"];

    // type 값 유효성 검사 : type이 존재하면 유효성 검사 수행
    if (type !== undefined && !validGoalTypes.includes(type)) {
      throw new Error(`유효하지 않은 목표 타입입니다. (${type})`);
    }

    const { success, statusCode, message } = await validateUserAndLedger(
      userId,
      ledgerId,
      goalId,
      categoryId
    );
    if (!success) return { statusCode, message };

    const newGoal = await models.Goal.findOne({
      where: { ledgerId, id: goalId },
      include: [
        {
          model: models.Category,
          as: "category_goals",
          attributes: ["name"],
        },
      ],
    });

    if (newGoal) {
      if (title) newGoal.title = title;
      if (target_amount) newGoal.target_amount = target_amount;
      if (current_amount) newGoal.current_amount = current_amount;
      if (start_date) newGoal.start_date = start_date;
      if (end_date) newGoal.end_date = end_date;
      if (type) newGoal.type = type;
      if (status !== undefined && newGoal.status !== status)
        newGoal.status = status;
      if (categoryId) newGoal.categoryId = categoryId;
    }

    await newGoal.save();

    return {
      statusCode: 200,
      message: `${newGoal.category_goals.name} 카테고리의 목표가 수정되었습니다.`,
      data: newGoal,
    };
  } catch (error) {
    throw error;
  }
};

// 목표 삭제
const deleteGoal = async (userId, ledgerId, goalId) => {
  try {
    const { success, statusCode, message } = await validateUserAndLedger(
      userId,
      ledgerId,
      goalId
    );
    if (!success) return { statusCode, message };

    const goal = await models.Goal.findOne({
      where: { ledgerId, id: goalId },
      include: [
        {
          model: models.Category,
          as: "category_goals",
          attributes: ["name"],
        },
      ],
    });

    if (goal) {
      await goal.destroy();
    } else {
      return {
        statusCode: 404,
        message: "해당 목표는 이미 삭제되었거나 존재하지 않습니다.",
      };
    }

    return {
      statusCode: 200,
      message: `${goal.category_goals.name} 카테고리의 목표를 삭제했습니다.`,
    };
  } catch (error) {
    throw error;
  }
};

const validateUserAndLedger = async (userId, ledgerId, goalId, categoryId) => {
  const user = await models.User.findByPk(userId);
  if (!user) {
    return {
      success: false,
      statusCode: 404,
      message: "사용자 정보를 찾을 수 없습니다.",
    };
  }

  const ledger = await models.Ledger.findByPk(ledgerId);
  if (!ledger) {
    return {
      success: false,
      statusCode: 404,
      message: "해당 가계부를 찾을 수 없습니다.",
    };
  }

  // 만약 공유 가계부라면 멤버인지 소유주인지 확인
  if (ledger.is_shared) {
    const isMember = await models.LedgerMember.findOne({
      where: { ledgerId, userId },
    });

    if (!isMember) {
      return {
        success: false,
        statusCode: 404,
        message: "해당 가계부에 접근할 수 없습니다.",
      };
    }

    // if (isMember.role === "member") {
    //   return {
    //     success: false,
    //     statusCode: 404,
    //     message: "공유 가계부의 목표는 소유주가 설정할 수 있습니다.",
    //   };
    // }
  }

  if (categoryId) {
    const category = await models.Category.findByPk(categoryId);

    if (!category) {
      return {
        success: false,
        statusCode: 404,
        message: "카테고리를 찾을 수 없습니다.",
      };
    }
  }

  return {
    success: true,
    statusCode: 200,
    user,
    ledger,
  };
};

module.exports = {
  addGoals,
  getGoals,
  findGoal,
  updateGoal,
  deleteGoal,
};
