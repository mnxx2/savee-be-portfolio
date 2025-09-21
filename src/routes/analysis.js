const express = require("express");
const router = express.Router();
const analysisController = require("../controllers/analysisController");
const { authenticate } = require("../middlewares/authMiddleware");
const { checkPersonalLedger } = require("../middlewares/statisticMiddleware");

router.get(
  "/summary",
  authenticate,
  checkPersonalLedger,
  analysisController.getSummaryAnalysis
);

router.post(
  "/strategy",
  authenticate,
  checkPersonalLedger,
  analysisController.getStrategyAnalysis
);

module.exports = router;
