const models = require("../models");

// 예산 설정
const addBudgets = async (
  userId,
  ledgerId,
  year,
  month,
  limit_amount,
  categoryId
) => {
  try {
    const { success, status, message } = await validateUserAndLedger(
      userId,
      ledgerId,
      categoryId
    );
    if (!success) return { status, message };

    const budget = await models.Budget.create({
      year,
      month,
      limit_amount,
      categoryId,
      ledgerId,
    });

    const result = await models.Budget.findByPk(budget.id, {
      include: [
        {
          model: models.Category,
          as: "category_budgets",
          attributes: ["name"],
        },
      ],
    });

    return {
      status: 200,
      message: `${result.category_budgets.name} 카테고리에 예산이 설정되었습니다.`,
      data: result,
    };
  } catch (error) {
    throw error;
  }
};

// 예산 목록 조회
const getBudgets = async (userId, ledgerId) => {
  try {
    const { success, status, message } = await validateUserAndLedger(
      userId,
      ledgerId
    );
    if (!success) return { status, message };

    const budgets = await models.Budget.findAll({
      where: { ledgerId },
      include: [
        {
          model: models.Category,
          as: "category_budgets",
          attributes: ["name"],
        },
      ],
    });

    return {
      status: 200,
      message: "해당 가계부에 설정되어 있는 예산을 가져왔습니다.",
      data: budgets,
    };
  } catch (error) {
    throw error;
  }
};

// 예산 상세 조회
const findBudget = async (userId, ledgerId, budgetId) => {
  try {
    const { success, status, message } = await validateUserAndLedger(
      userId,
      ledgerId,
      budgetId
    );
    if (!success) return { status, message };

    const budget = await models.Budget.findOne({
      where: { ledgerId, id: budgetId },
      include: [
        {
          model: models.Category,
          as: "category_budgets",
          attributes: ["name"],
        },
      ],
    });

    return {
      status: 200,
      message: `${budget.category_budgets.name} 카테고리의 예산을 가져왔습니다.`,
      data: budget,
    };
  } catch (error) {
    throw error;
  }
};

// 예산 수정
const updateBudget = async (
  userId,
  ledgerId,
  budgetId,
  categoryId,
  year,
  month,
  limit_amount
) => {
  try {
    const { success, status, message } = await validateUserAndLedger(
      userId,
      ledgerId,
      budgetId,
      categoryId
    );
    if (!success) return { status, message };

    const newBudget = await models.Budget.findOne({
      where: { ledgerId, id: budgetId },
      include: [
        {
          model: models.Category,
          as: "category_budgets",
          attributes: ["name"],
        },
      ],
    });

    if (newBudget) {
      if (year) newBudget.year = year;
      if (month) newBudget.month = month;
      if (limit_amount) newBudget.limit_amount = limit_amount;
      if (categoryId) newBudget.categoryId = categoryId;
    }

    await newBudget.save();

    return {
      status: 200,
      message: `${newBudget.category_budgets.name} 카테고리의 예산이 수정되었습니다.`,
      data: newBudget,
    };
  } catch (error) {
    throw error;
  }
};

// 예산 삭제
const deleteBudget = async (userId, ledgerId, budgetId) => {
  try {
    const { success, status, message } = await validateUserAndLedger(
      userId,
      ledgerId,
      budgetId
    );
    if (!success) return { status, message };

    const budget = await models.Budget.findOne({
      where: { ledgerId, id: budgetId },
      include: [
        {
          model: models.Category,
          as: "category_budgets",
          attributes: ["name"],
        },
      ],
    });

    if (budget) {
      await budget.destroy();
    }

    return {
      status: 200,
      message: `${budget.category_budgets.name} 카테고리의 에산을 삭제했습니다.`,
    };
  } catch (error) {
    throw error;
  }
};

const validateUserAndLedger = async (
  userId,
  ledgerId,
  budgetId,
  categoryId
) => {
  const user = await models.User.findByPk(userId);
  if (!user) {
    return {
      success: false,
      status: 404,
      message: "사용자 정보를 찾을 수 없습니다.",
    };
  }

  const ledger = await models.Ledger.findByPk(ledgerId);
  if (!ledger) {
    return {
      success: false,
      status: 404,
      message: "해당 가계부를 찾을 수 없습니다.",
    };
  }

  // 만약 공유 가계부라면 멤버인지 소유주인지 확인
  if (ledger.is_shared) {
    const isMember = await models.LedgerMember.findOne({
      where: { ledgerId, id: userId },
    });

    if (!isMember) {
      return {
        success: false,
        status: 404,
        message: "해당 가계부에 접근할 수 없습니다.",
      };
    }

    if (isMember.role === "member") {
      return {
        success: false,
        status: 404,
        message: "공유 가계부의 예산은 소유주가 설정할 수 있습니다.",
      };
    }
  }

  if (categoryId) {
    const category = await models.Category.findByPk(categoryId);

    if (!category) {
      return {
        success: false,
        status: 404,
        message: "카테고리를 찾을 수 없습니다.",
      };
    }
  }

  if (budgetId && categoryId) {
    const budget = await models.Budget.findOne({
      where: { ledgerId, categoryId },
    });

    if (budget) {
      return {
        success: false,
        status: 404,
        message: "이미 해당 카테고리에 예산이 설정되어 있습니다.",
      };
    }
  }

  return {
    success: true,
    status: 200,
    user,
    ledger,
  };
};

module.exports = {
  addBudgets,
  getBudgets,
  findBudget,
  updateBudget,
  deleteBudget,
};
