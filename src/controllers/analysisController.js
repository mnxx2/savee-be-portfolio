const analysisService = require("../services/analysisService");

const getSummaryAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;
    const ledgerId = req.personalLedger.id;
    const { summary } = await analysisService.getSummary(userId, ledgerId);
    res.status(200).json({ summary });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "소비 요약 로드 중 오류가 발생했습니다.";
    res.status(status).json({ error: message });
  }
};

const getStrategyAnalysis = async (req, res) => {
  try {
    const { summary } = req.body;
    const { strategy } = await analysisService.getStrategy({ summary });
    res.status(200).json({ strategy });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "코칭 전략 생성 중 오류가 발생했습니다.";
    res.status(status).json({ error: message });
  }
};

module.exports = { getSummaryAnalysis, getStrategyAnalysis };
