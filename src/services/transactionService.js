const { Op } = require("sequelize");
const models = require("../models");
const dayjs = require("dayjs");

const addTransactions = async (
  userId,
  ledgerId,
  categoryId,
  type,
  amount,
  memo,
  date
) => {
  try {
    const { success, status, message } = await vaildateUserAndLedger(
      userId,
      ledgerId
    );
    if (!success) return { status, message };

    const transac = await models.Transaction.create({
      type,
      amount,
      memo,
      categoryId,
      ledgerId,
      date,
      userId,
    });

    const result = await models.Transaction.findByPk(transac.id, {
      include: [
        {
          model: models.Category,
          as: "category_transactions",
          attributes: ["name"],
        },
      ],
    });

    return {
      status: 200,
      message: "수입/지출 입력이 완료되었습니다.",
      data: result,
    };
  } catch (error) {
    throw error;
  }
};

const getTransactions = async (userId, ledgerId) => {
  try {
    const { success, status, message } = await vaildateUserAndLedger(
      userId,
      ledgerId
    );
    if (!success) return { status, message };

    const transac = await models.Transaction.findAll({
      where: {
        ledgerId,
      },
      include: [
        {
          model: models.Category,
          as: "category_transactions",
          attributes: ["name"],
        },
      ],
    });

    return {
      status: 200,
      message: "수입/지출 목록을 가져왔습니다.",
      data: transac,
    };
  } catch (error) {
    throw error;
  }
};

const findTransaction = async (userId, ledgerId, transactionId) => {
  try {
    const { success, status, message } = await vaildateUserAndLedger(
      userId,
      ledgerId,
      transactionId
    );
    if (!success) return { status, message };

    const transac = await models.Transaction.findByPk(transactionId, {
      include: [
        {
          model: models.Category,
          as: "category_transactions",
          attributes: ["name"],
        },
      ],
    });

    if (!transac) {
      return { status: 404, message: "해당 내역을 찾을 수 없습니다." };
    }

    return {
      status: 200,
      message: "수입/지출 내역을 가져왔습니다.",
      data: transac,
    };
  } catch (error) {
    throw error;
  }
};

const updateTransaction = async (
  userId,
  ledgerId,
  transactionId,
  categoryId,
  type,
  amount,
  memo
) => {
  try {
    const { success, status, message } = await vaildateUserAndLedger(
      userId,
      ledgerId,
      transactionId
    );
    if (!success) return { status, message };

    const transaction = await models.Transaction.findByPk(transactionId, {
      include: [
        {
          model: models.Category,
          as: "category_transactions",
          attributes: ["name"],
        },
      ],
    });

    if (transaction) {
      if (categoryId) transaction.categoryId = categoryId;
      if (type) transaction.type = type;
      if (amount) transaction.amount = amount;
      if (memo) transaction.memo = memo;
    }

    await transaction.save();
    return {
      status: 200,
      message: "수입/지출 내역을 수정했습니다.",
      data: transaction,
    };
  } catch (error) {
    throw error;
  }
};

const deleteTransaction = async (userId, ledgerId, transactionId) => {
  try {
    const { success, status, message } = await vaildateUserAndLedger(
      userId,
      ledgerId,
      transactionId
    );
    if (!success) return { status, message };

    await models.Transaction.destroy({ where: { id: transactionId } });

    return { status: 200, message: "수입/지출 내역이 삭제되었습니다." };
  } catch (error) {
    throw error;
  }
};

const getDailyTransactions = async (userId, ledgerId, month) => {
  try {
    // 값을 입력하지 않았을 때 현재 월로 설정
    if (!month) {
      const now = new Date();
      const yyyy = now.getFullYear();
      // js에서 new Date(year, month, day) 생성자는 월을 0부터 시작
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      month = `${yyyy}-${mm}`;
    }

    const { success, status, message } = await vaildateUserAndLedger(
      userId,
      ledgerId
    );
    if (!success) return { status, message };

    const [year, mm] = month.split("-");
    const yearInt = parseInt(year, 10);
    const monthInt = parseInt(mm, 10);
    // monthInt는 다음달로 사용, 다음달의 0일은 전월의 마지막날
    // getDate() : 해당 날짜의 일(day)을 가져옴
    const lastDay = new Date(yearInt, monthInt, 0).getDate();
    const startDate = `${year}-${mm}-01`;
    const endDate = `${year}-${mm}-${String(lastDay).padStart(2, "0")}`;

    const transactions = await models.Transaction.findAll({
      where: {
        ledgerId,
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
      order: [
        ["date", "DESC"],
        ["createdAt", "ASC"],
      ],
      include: [
        {
          model: models.Category,
          as: "category_transactions",
          attributes: ["name"],
        },
      ],
    });

    if (transactions.length === 0) {
      return { status: 404, message: "해당 월에 입력한 내역이 없습니다." };
    }

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((trs) => {
      if (trs.type === "income") totalIncome += trs.amount;
      if (trs.type === "expense") totalExpense += trs.amount;
    });

    return {
      status: 200,
      message: `${month}의 거래 내역`,
      data: { transactions, summary: { totalIncome, totalExpense } },
    };
  } catch (error) {
    throw error;
  }
};

const getWeeklyTransactions = async (userId, ledgerId, month) => {
  try {
    // 값을 입력하지 않았을 때 현재 월로 설정
    if (!month) {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      month = `${yyyy}-${mm}`;
    }

    const { success, status, message } = await vaildateUserAndLedger(
      userId,
      ledgerId
    );
    if (!success) return { status, message };

    // 마지막날 계산
    const [year, mm] = month.split("-");
    const yearInt = parseInt(year, 10);
    const monthInt = parseInt(mm, 10);
    const lastDay = new Date(yearInt, monthInt, 0).getDate();

    // 주차별로 반복하며 수입/지출 계산
    const weeks = [];

    // 한 달을 7일로 쪼개기 위해 7씩 증가 : 시작일은 1, 8, 15 ...
    for (let i = 1; i <= lastDay; i += 7) {
      const startDay = i;
      // 한 주의 종료일을 최대 lastDay로 제한, 마지막 주에서 오류 방지
      const endDay = Math.min(i + 6, lastDay);

      const startDate = `${year}-${mm}-${String(startDay).padStart(2, "0")}`;
      const endDate = `${year}-${mm}-${String(endDay).padStart(2, "0")}`;

      const transactions = await models.Transaction.findAll({
        where: {
          ledgerId,
          date: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: [
          {
            model: models.Category,
            as: "category_transactions",
            attributes: ["name"],
          },
        ],
        order: [
          ["date", "ASC"],
          ["createdAt", "ASC"],
        ],
      });

      // 한 주의 수입/지출 합산
      const totalIncome = transactions
        .filter((trs) => trs.type === "income")
        .reduce((sum, trs) => sum + trs.amount, 0);
      const totalExpense = transactions
        .filter((trs) => trs.type === "expense")
        .reduce((sum, trs) => sum + trs.amount, 0);

      // 전주 대비 한 주의 수입/지출 증감 계산
      // 첫 주면 이전 주가 없으므로 0으로 설정
      const previousWeek = weeks[weeks.length - 1];
      const analysIncome = previousWeek ? totalIncome - previousWeek.income : 0;
      const analysExpense = previousWeek
        ? totalExpense - previousWeek.expense
        : 0;

      weeks.push({
        week: `${startDate} ~ ${endDate}`,
        income: totalIncome,
        expense: totalExpense,
        analysIncome: analysIncome,
        analysExpense: analysExpense,
        transactions,
      });
    }

    return { status: 200, message: `${month} 주간 가계부`, data: weeks };
  } catch (error) {
    throw error;
  }
};

const getMonthlyCalendarTransactions = async (userId, ledgerId, month) => {
  try {
    // 값을 입력하지 않았을 때 현재 월로 설정
    if (!month) {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      month = `${yyyy}-${mm}`;
    }

    const { success, status, message } = await vaildateUserAndLedger(
      userId,
      ledgerId
    );
    if (!success) return { status, message };

    const [year, mm] = month.split("-");
    const yearInt = parseInt(year, 10);
    const monthInt = parseInt(mm, 10);

    const lastDay = new Date(yearInt, monthInt, 0).getDate();

    // 일별 내역 결과를 저장할 배열
    const daily = [];

    for (let day = 1; day <= lastDay; day++) {
      // 1일부터 시작 31일까지 출력,
      // monthInt는 0-base이기 때문에 이전 달의 마지막 날이 나오므로 day에 +1을 해서 이번달 첫날로 지정
      const currentDate = new Date(yearInt, monthInt - 1, day + 1);
      // YYYY-MM-DD
      const formattedDate = currentDate.toISOString().split("T")[0];

      const transactions = await models.Transaction.findAll({
        where: {
          ledgerId,
          date: formattedDate,
        },
        include: [
          {
            model: models.Category,
            as: "category_transactions",
            attributes: ["name"],
          },
        ],
        order: [["createdAt", "ASC"]],
      });

      // 총 수입/지출 금액
      let totalIncome = 0;
      let totalExpense = 0;

      transactions.forEach((trs) => {
        if (trs.type === "income") totalIncome += trs.amount;
        if (trs.type === "expense") totalExpense += trs.amount;
      });

      daily.push({
        date: formattedDate,
        totalIncome,
        totalExpense,
        transactions,
      });
    }

    return { status: 200, message: `${month} 월간 가계부`, data: daily };
  } catch (error) {
    throw error;
  }
};

const getGoalsTransactions = async (userId, ledgerId, start_date, end_date) => {
  try {
    if (
      !dayjs(start_date, "YYYY-MM-DD", true).isValid() ||
      !dayjs(end_date, "YYYY-MM-DD", true).isValid()
    ) {
      return {
        status: 400,
        message: "날짜 형식이 잘못되었습니다. YYYY-MM-DD 형식이어야 합니다.",
      };
    }

    const stDate = dayjs(start_date).format("YYYY-MM-DD");
    const edDate = dayjs(end_date).format("YYYY-MM-DD");

    const { success, status, message } = await vaildateUserAndLedger(
      userId,
      ledgerId
    );
    if (!success) return { status, message };

    const transactions = await models.Transaction.findAll({
      where: {
        ledgerId,
        date: {
          [Op.between]: [stDate, edDate],
        },
      },
      include: [{ model: models.Category, as: "category_transactions" }],
    });

    const totalIncome = transactions
      .filter((ts) => ts.type === "income")
      .reduce((sum, trs) => sum + trs.amount, 0);

    // expense는 음수로 변환
    const totalExpense = transactions
      .filter((ts) => ts.type === "expense")
      .reduce((sum, trs) => sum + trs.amount, 0);

    const summary = totalIncome + totalExpense;

    return {
      status: 200,
      message: "해당 가계부의 목표에 들어가는 수입/지출 내역을 가져왔습니다.",
      data: { transactions, totalIncome, totalExpense, summary },
    };
  } catch (error) {
    throw error;
  }
};

const vaildateUserAndLedger = async (userId, ledgerId, transactionId) => {
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
  const ledger = await models.Ledger.findByPk(ledgerId, {
    include: [{ model: models.LedgerMember, as: "ledger_ledgermembers" }],
  });

  if (!ledger) {
    return {
      success: false,
      status: 404,
      message: "해당 가계부를 찾을 수 없습니다.",
    };
  }

  // 둘 중 하나라도 권한이 없으면 가계부에 접근 못 하도록 설정
  // 개인 가계부 소유자이거나, ledgerMember로 등록되어 있어야 접근 가능
  const isOwner = ledger.userId === userId;
  const isMember = ledger.ledger_ledgermembers?.some(
    (member) => member.userId === userId
  );

  if (!isOwner && !isMember) {
    return {
      success: false,
      status: 403,
      message: "가계부에 접근할 권한이 없습니다.",
    };
  }

  // 해당 트랜잭션이 가계부에 속하는지 확인
  if (transactionId) {
    const transaction = await models.Transaction.findByPk(transactionId);
    if (!transaction) {
      return {
        success: false,
        status: 404,
        message: "해당 내역을 찾을 수 없습니다.",
      };
    }

    if (transaction.ledgerId !== Number(ledgerId)) {
      return {
        success: false,
        message: "해당 내역을 가계부에서 찾을 수 없습니다.",
      };
    }
  }

  return { success: true, status: 200, user, ledger };
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
