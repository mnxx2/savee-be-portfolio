const models = require("../models");
const { Op } = require("sequelize");
const {
  getDateRange,
  getCurrentWeekInfo,
  getCurrentMonthInfo,
  getISOWeeksOfMonth,
  dayjs,
  getLast7Days,
  getLastMonthDateRange,
} = require("../utils/dateHelper");
const {
  filterByDateRange,
  groupByCategory,
  sumByCategory,
} = require("../utils/statHelper");
const { getTransactions } = require("./transactionService");

// 카테고리별 지출 통계 관련 함수 리팩토링
// 기간 내 지출 필터링
const getExpensesByPeriod = async ({ userId, ledgerId, type }) => {
  // 1. 기준 기간 구하기 (주간/월간)
  let year, unitValue;
  if (type === "weekly") {
    const weekInfo = getCurrentWeekInfo();
    year = weekInfo.year;
    unitValue = weekInfo.week;
  } else if (type === "monthly") {
    const monthInfo = getCurrentMonthInfo();
    year = monthInfo.year;
    unitValue = monthInfo.month;
  } else {
    const error = new Error("타입은 'weekly' 또는 'monthly'만 가능합니다.");
    error.status = 400;
    throw error;
  }
  const { start, end } = getDateRange(type, year, unitValue);
  // 2. 기간 내에 포함되는 지출 데이터 필터링
  // getTransactions 함수에 category 조인
  const response = await getTransactions(userId, ledgerId);

  const data = response.data || [];
  const expenses = data.filter((item) => item.type === "expense");
  return filterByDateRange(expenses, start, end);
};

// 카테고리별 지출 내역
const getGroupedExpenses = async (params) => {
  const expenses = await getExpensesByPeriod(params);
  // 최신순 정렬 (date 기준 내림차순)
  const sortedExpenses = expenses.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  // 3. 카테고리별로 그룹화
  return groupByCategory(sortedExpenses);
};

// 카테고리별 지출 통계
const getCategoryExpensing = async (params) => {
  const groupedData = await getGroupedExpenses(params);

  // 4. 카테고리별 총합 계산
  const groupByTotal = sumByCategory(groupedData);

  // 5. 포맷 정리 및 반환
  return groupByTotal;
};

// 카테고리별 지출 통계 데이터베이스 반영
// const updateCategoryStats = async ({ userId, ledgerId, type }) => {
//   let currentWeek, currentMonth;
//   const weekInfo = getCurrentWeekInfo();
//   currentWeek = weekInfo.year;
//   const monthInfo = getCurrentMonthInfo();
//   currentMonth = monthInfo.month;
//   const groupedData = await getCategoryExpensing({ userId, ledgerId, type });
//   for (const category of groupedData) {
//     await models.CategoryStatistics.upsert({
//       userId,
//       ledgerId,
//       categoryId: category.id,
//       week: type === "weekly" ? currentWeek : null,
//       month: type === "monthly" ? currentMonth : null,
//       totalAmount: category.totalAmount,
//     });
//   }
// };

// 지출 추이 - 1. 총합 추이
// 1-1. 월간 총합 추이

// 월간 지출 내역을 가져오는 함수로 분리
const getMonthlyExpensesList = async (userId, ledgerId, year, month) => {
  // 수입 지출 목록 조회
  const response = await getTransactions(userId, ledgerId);
  const data = response.data || [];
  // 지출 항목 필터링
  const expenses = data.filter((item) => item.type === "expense");

  // 월 단위 시작일과 종료일 계산
  const { start, end } = getDateRange("monthly", year, month);
  // 기간 내 필터링
  const filtered = filterByDateRange(expenses, start, end);
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  return filtered; // 해당 월의 지출 목록 배열 반환
};

// 월간 지출 총합
const getMonthlyTotalExpensing = async (userId, ledgerId) => {
  const { year, month: currentMonth } = getCurrentMonthInfo();
  const monthlyTotal = [];

  // 1. 올해의 1월부터 현재까지 반복
  for (let monthIndex = 1; monthIndex <= currentMonth; monthIndex++) {
    // 2. 월간 지출 내역 조회
    const expenses = await getMonthlyExpensesList(
      userId,
      ledgerId,
      year,
      monthIndex
    );
    let total = 0;
    expenses.forEach((element) => {
      total += element.amount;
    });
    monthlyTotal.push({ month: monthIndex, total });
  }
  return monthlyTotal;
};

// 1-2. 주간 총합 추이

// 주간 지출 내역을 가져오는 함수로 분리
const getWeeklyExpensesList = async (userId, ledgerId) => {
  const { year, month: currentMonth } = getCurrentMonthInfo();

  // 1. 지출 데이터 조회
  const response = await getTransactions(userId, ledgerId);
  const data = response.data || [];
  const expenses = data.filter((item) => item.type === "expense");
  // 2. 조회 기간 산출
  // 이번 달의 모든 iso 주차 번호
  const weeksInMonth = getISOWeeksOfMonth(year, currentMonth);
  // 지출 내역에 iso 주차 번호 부여
  const expensesWithWeek = expenses
    .filter((expense) => dayjs(expense.date).month() === currentMonth - 1)
    .map((expense) => {
      const week = dayjs(expense.date).isoWeek();
      return { ...expense.dataValues, week };
    });

  // 3. 주차별 데이터 그룹핑
  const groupByWeek = expensesWithWeek.reduce((acc, curr) => {
    // acc: 누적값, curr: 현재 처리중인 expense
    const week = curr.week;
    if (!acc[week]) {
      acc[week] = [];
    }
    acc[week].push(curr);
    return acc;
  }, {});
  // 4. 이번달의 모든 주차에 대한 지출 내역 배열 반환
  const weeklyExpenses = weeksInMonth.map((week) => {
    const expensesForWeek = groupByWeek[week] || [];
    expensesForWeek.sort((a, b) => {
      return dayjs(b.date).valueOf() - dayjs(a.date).valueOf();
    });

    return {
      week,
      expenses: expensesForWeek,
    };
  });

  return weeklyExpenses;
};

// 주간 지출 총합
const getWeeklyTotalExpensing = async (userId, ledgerId) => {
  const weeklyExpenses = await getWeeklyExpensesList(userId, ledgerId);
  // 5. 주차별 총합 계산 -> 지출 내역 없는 주차는 total=0
  const weeklySum = weeklyExpenses.map(({ week, expenses }) => {
    const total = expenses.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );
    return {
      week,
      total,
    };
  });

  return weeklySum;
};

// 지출 추이 - 2. 최근 7일의 일일 추이
const getLast7DaysExpensing = async (userId) => {
  // 1. 최근 7일에 대한 날짜 산출
  const period = getLast7Days(); // 배열
  // 2. 최근 7일에 대한 지출 데이터 조회
  const expenses = await models.Transaction.findAll({
    where: {
      userId,
      type: "expense",
      date: { [Op.between]: [period[0], period[6]] },
    },
  });
  // 3. 날짜별 데이터 그룹화 및 합산
  // 날짜별 합계 초기화
  const dailyTotals = {};
  period.forEach((date) => {
    const formatted = dayjs(date).format("YYYY-MM-DD");
    dailyTotals[formatted] = 0;
  });

  expenses.forEach((expense) => {
    const date = dayjs(expense.date).format("YYYY-MM-DD");

    if (dailyTotals[date] !== undefined) {
      dailyTotals[date] += expense.amount;
    }
  });

  const result = period.map((date) => {
    const formatted = dayjs(date).format("YYYY-MM-DD");
    return {
      date: formatted,
      total: dailyTotals[formatted],
    };
  });

  return result;
};

// 소비 분석용 데이터 추출
// 지난 달 데이터를 가져오기 위한 기간 지정 지출 조회 함수 생성
const getExpensesByCustomPeriod = async ({ userId, ledgerId, start, end }) => {
  const response = await getTransactions(userId, ledgerId);
  const data = response.data || [];
  const expenses = data.filter((item) => item.type === "expense");
  return filterByDateRange(expenses, start, end);
};

// 지난 달 카테고리별 지출 구하기
const getLastMonthCategoryExpensing = async ({ userId, ledgerId }) => {
  // 지난달의 시작/끝 날짜 계산
  const { start, end } = getLastMonthDateRange();
  const expenses = await getExpensesByCustomPeriod({
    userId,
    ledgerId,
    start,
    end,
  });
  const grouped = groupByCategory(expenses);
  return sumByCategory(grouped);
};

module.exports = {
  getExpensesByPeriod,
  getGroupedExpenses,
  getCategoryExpensing,
  getMonthlyExpensesList,
  getMonthlyTotalExpensing,
  getWeeklyExpensesList,
  getWeeklyTotalExpensing,
  getLast7DaysExpensing,
  // updateCategoryStats,
  getExpensesByCustomPeriod,
  getLastMonthCategoryExpensing,
};
