const dayjs = require("dayjs");
const isoWeek = require("dayjs/plugin/isoWeek");

dayjs.extend(isoWeek);

// const now = dayjs(); // 현재 시간
// const today = now.format("YYYY-MM-DD"); // 오늘 날짜
const year = dayjs().year(); // 올해
const month = dayjs().month() + 1; // 이번 달 (월은 0부터 시작)
const week = dayjs().isoWeek(); // 올해에서 이번 주의 주차

const getCurrentMonthInfo = () => {
  return { year: year, month: month };
};

const getCurrentWeekInfo = () => {
  return { year: year, week: week };
};

const getDateRange = (type, year, monthOrWeek) => {
  switch (type) {
    case "weekly":
      const startOfWeek = dayjs()
        .year(year)
        .isoWeek(monthOrWeek)
        .startOf("isoWeek")
        .format("YYYY-MM-DD");
      const endOfWeek = dayjs()
        .year(year)
        .isoWeek(monthOrWeek)
        .endOf("isoWeek")
        .format("YYYY-MM-DD");
      return { start: startOfWeek, end: endOfWeek };

    case "monthly":
      const startOfMonth = dayjs(`${year}-${monthOrWeek}-01`)
        .startOf("month")
        .format("YYYY-MM-DD");
      const endOfMonth = dayjs(`${year}-${monthOrWeek}-01`)
        .endOf("month")
        .format("YYYY-MM-DD");
      return { start: startOfMonth, end: endOfMonth };
  }
};

// 월에 포함된 주차 리스트 추출
const getISOWeeksOfMonth = (year, month) => {
  const startOfMonth = dayjs(`${year}-${month}-01`);
  const endOfMonth = startOfMonth.endOf("month");

  const startWeek = startOfMonth.isoWeek();
  const endWeek = endOfMonth.isoWeek();

  let weeks = [];
  for (let w = startWeek; w <= endWeek; w++) {
    weeks.push(w);
  }
  return weeks;
};

// 최근 7일 날짜 추출
const getLast7Days = () => {
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    last7Days.push(dayjs().subtract(i, "day").format("YYYY-MM-DD"));
  }
  return last7Days;
};

// 지난달 년,월 정보 구하기
const getLastMonthInfo = () => {
  const lastMonth = dayjs().subtract(1, "month");
  return { year: lastMonth.year(), month: lastMonth.month() + 1 };
};

// 지난달 시작,끝 날짜 구하기
const getLastMonthDateRange = () => {
  const { year, month } = getLastMonthInfo();
  return getDateRange("monthly", year, month);
};

module.exports = {
  dayjs,
  getCurrentMonthInfo,
  getCurrentWeekInfo,
  getDateRange,
  getISOWeeksOfMonth,
  getLast7Days,
  getLastMonthInfo,
  getLastMonthDateRange,
};
