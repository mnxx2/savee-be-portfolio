const models = require("../models");

const checkPersonalLedger = async (req, res, next) => {
  const userId = req.user.id;
  const personalLedger = await models.Ledger.findOne({
    where: { userId, is_shared: false },
  });
  if (!personalLedger) {
    return res.status(404).json({ message: "가계부를 찾을 수 없습니다." });
  }
  const transactionCount = await models.Transaction.count({
    where: { ledgerId: personalLedger.id },
  });
  if (transactionCount === 0) {
    return res.status(404).json({ message: "가계부에 거래내역이 없습니다." });
  }
  req.personalLedger = personalLedger;
  next();
};

module.exports = { checkPersonalLedger };
