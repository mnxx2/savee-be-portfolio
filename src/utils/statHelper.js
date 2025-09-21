const dayjs = require("dayjs");
const isBetween = require("dayjs/plugin/isBetween");

dayjs.extend(isBetween);

// 기간 내 데이터 필터링
const filterByDateRange = (data, start, end) => {
  return data.filter((item) =>
    dayjs(item.date).isBetween(start, end, null, "[]")
  );
};
// filter : true 인 항목만 남겨줌
// [] : 경계 포함 (start, end의 날짜 포함)

// 카테고리별로 데이터 그룹화
const groupByCategory = (data) => {
  return data.reduce((acc, item) => {
    const category = item.category_transactions?.name || "기타";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {}); // {} : 초기값 {}로 시작
};

// 카테고리별 지출 총합
const sumByCategory = (groupedData) => {
  return Object.entries(groupedData).map(([category, items]) => {
    const total = items.reduce((sum, item) => sum + item.amount, 0); // reduce에서 초기값 0
    return { category, total };
  });
};

module.exports = { filterByDateRange, groupByCategory, sumByCategory };
