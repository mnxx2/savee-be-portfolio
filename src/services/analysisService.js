const { chatGPT } = require("../utils/ai");
const {
  getCategoryExpensing,
  getWeeklyTotalExpensing,
  getMonthlyTotalExpensing,
  getLast7DaysExpensing,
  getLastMonthCategoryExpensing,
} = require("./statisticService");

const getSummary = async (userId, ledgerId) => {
  const type = "monthly";
  const groupedData = await getCategoryExpensing({ userId, ledgerId, type });
  const lastMonthGroupedData = await getLastMonthCategoryExpensing({
    userId,
    ledgerId,
  });
  const monthlyTrendData = await getMonthlyTotalExpensing(userId, ledgerId);
  const weeklyTrendData = await getWeeklyTotalExpensing(userId, ledgerId);
  const last7DaysData = await getLast7DaysExpensing(userId);

  const summaryPrompt = `
    사용자의 지출 데이터를 요약해줘. 
    반드시 내가 제공한 숫자 데이터만 사용해서 계산해야 하며, 
    임의로 추정하거나 다른 수치를 만들어내지 마. 
    계산 규칙은 아래와 같이 지켜야 한다.
    
    - 모든 계산은 내가 준 데이터 값에서만 수행한다.
    - 절대 오차(원 단위)는 1원도 발생하지 않아야 한다.
    - 퍼센트 계산은 (이번달 - 지난달) / 지난달 * 100 으로 계산한다.
    - 퍼센트는 소수점 첫째 자리에서 반올림하여 정수로 출력한다. (예: 18.4% → 18, 18.5% → 19)
    - 퍼센트는 항상 절대값으로 표시하되, type 필드로 "증가" 또는 "감소"를 명시한다.
    - JSON 형식 결과에 들어가는 모든 값은 계산된 최종 값만 넣는다. 
    - JSON 외 불필요한 설명이나 주석은 절대 추가하지 마라.
    - summaryText 필드는 자연스러운 스토리텔링으로 작성하고, 나머지 숫자/카테고리는 JSON 필드에서 제공.

    summaryText 필드는 다음 기준으로 작성:
    1. 자연스러운 스토리텔링 문장으로 작성
    2. 입력 데이터 전반(groupedData, lastMonthGroupedData, monthlyTrendData, weeklyTrendData, last7DaysData)을 참고하여 다방면으로 분석
    3. 이번 달 소비 패턴, 변화, 눈에 띄는 특징, 주별 흐름 등을 풍부하게 서술
    4. 숫자는 JSON 필드(biggestChange, totalChange, maxSpendingDay)에서 계산된 값을 그대로 반영
    5. 불필요한 설명이나 추정 숫자는 포함하지 않음

    입력 데이터:
    - 이번 달 카테고리별 지출: ${JSON.stringify(groupedData)}
    - 지난 달 카테고리별 지출: ${JSON.stringify(lastMonthGroupedData)}
    - 월별 총 지출 추이: ${JSON.stringify(monthlyTrendData)}
    - 주별 총 지출 추이: ${JSON.stringify(weeklyTrendData)}
    - 최근 7일의 일일 지출: ${JSON.stringify(last7DaysData)}

    출력 요구사항:
    위 데이터를 통해 아래 사항을 설명해줘. (위의 값은 반드시 그대로 사용해. 임의 계산하지 말고 반영해.)
    1. 지난 달 대비 이번 달 어떤 카테고리의 지출이 증가/감소했는지 분석
      - 가장 변화량이 큰 카테고리를 biggestChange 로 기록
      - amountDifference 는 (이번달 - 지난달)
      - percentChange 는 위 계산식에 따라 산출
      - type 은 "증가" 또는 "감소"
    2. 지난 달 대비 총 지출량의 증감
      - monthlyTrendData 의 최신 2개월 데이터를 비교
      - amount 는 (이번달 - 지난달)
      - percentChange 는 위 계산식에 따라 산출
      - type 은 "증가" 또는 "감소"
    3. 주차별 소비 패턴
      - weeklyTrendData 활용
      - 주차별 지출 합계 계산
      - 1~n주차 기준으로 변환 (이번 월의 첫번째 주차를 1주차로 시작)
      - 최대 지출 주차는 maxSpendingWeek로 기록
    4. 최근 7일 단기 트렌드 - 어느 요일에 소비가 많았는지
      - last7DaysData 활용

    출력 형식 (JSON 객체만, 다른 텍스트는 출력하지 마라):
    {
      "summaryText" : "string",
      "biggestChange": { "category": "string", "amountDifference": number, "percentChange": number, "type": "증가 | 감소", },
      "totalChange": {"amount": number, "percentChange": number, "type": "증가 | 감소",},
      "maxSpendingWeek": {"week": number, "amount": number}
      "maxSpendingDay": { "dayOfWeek": "string", "amount": number, },
    }
  `;

  const result = await chatGPT(summaryPrompt);
  let parsedResult;
  try {
    parsedResult = JSON.parse(result);
  } catch (error) {
    console.error("JSON 파싱 실패: ", error);
    parsedResult = { error: "결과 파싱 실패", raw: result };
  }
  return { summary: parsedResult };
};

const getStrategy = async ({ summary }) => {
  if (!summary) {
    const error = new Error("소비 요약 데이터가 필요합니다.");
    error.status = 400;
    throw error;
  }
  const strategyPrompt = `
    다음은 우리 소비분석 가계부 사용자의 이번 달 소비 요약 입니다. :
    ${JSON.stringify(summary)}

    위 소비 패턴을 분석하여 아래 사항을 제안해 주세요.
      1. 절약할 수 있는 구체적인 전략 3가지
      2. 주의가 필요한 소비 영역
      3. 긍정적인 소비 습관
      - 제안은 이해하기 쉽게 작성하고, 한국어로 작성해주세요.
      - 너무 추상적이지 않게 실제 생활에서 적용 가능한 팁을 제공해주세요.

      각 항목을 json 배열 형식으로 나눠서 반환해주세요.
      {
        "tips" : [
          {"item": "string", "description": "string"},
        ],
        "cautions": [
          {"item": "string", "description": "string"},
        ],
        "positiveHabits": [
          {"item": "string", "description": "string"},
        ],
      }
  `;
  const result = await chatGPT(strategyPrompt);
  let parsedResult;
  try {
    parsedResult = JSON.parse(result);
  } catch (error) {
    console.error("JSON 파싱 실패: ", error);
    parsedResult = { error: "결과 파싱 실패", raw: result };
  }
  return { strategy: parsedResult };
};

module.exports = { getSummary, getStrategy };
