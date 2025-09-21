require("dotenv").config();
const express = require("express");
const cors = require("cors");
const models = require("./models");

const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const ledgerRouter = require("./routes/ledger");
const postRouter = require("./routes/support");
const transactionRouter = require("./routes/transaction");
const qnaRouter = require("./routes/qna");
const adminRouter = require("./routes/admin");
const inviteRouter = require("./routes/invite");
const ledgerMemberRouter = require("./routes/ledgerMember");
const budgetRouter = require("./routes/budget");
const answerRouter = require("./routes/answer");
const commentRouter = require("./routes/comment");
const goalRouter = require("./routes/goal");
const statsRouter = require("./routes/statistic");
const analysisRouter = require("./routes/analysis");

const { sequelize } = require("./models");
const {
  seedCategories,
  seedUsers,
  seedLedgerAndTransactions,
  seedSupport,
} = require("./utils/seed");

const app = express();

// CORS 설정
app.use(
  cors({
    origin: "http://localhost:3000",
    // origin: "https://polite-dune-0f3b9e800.2.azurestaticapps.net",
    credentials: true,
  })
);

// 미들웨어 설정
app.use(express.json());

// 서버 구동 테스트
app.get("/", (req, res) => {
  res.send("hello savee api");
});

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/ledgers", ledgerRouter);
app.use("/ledgers/:ledgerId/transactions", transactionRouter);
app.use("/support", postRouter);
app.use("/qna", qnaRouter);
app.use("/admin", adminRouter);
app.use("/invites", inviteRouter);
app.use("/ledgers/:ledgerId/members", ledgerMemberRouter);
app.use("/ledgers/:ledgerId/budgets", budgetRouter);
app.use("/answer", answerRouter);
app.use("/ledgers/:ledgerId/comments", commentRouter);
app.use("/ledgers/:ledgerId/goals", goalRouter);
app.use("/statistics", statsRouter);
app.use("/analysis", analysisRouter);

// 서버 실행
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`${PORT}번 포트에서 서버 실행 중`);

  models.sequelize
    .sync({ force: false })
    .then(async () => {
      await seedCategories();
      await seedUsers();
      await seedLedgerAndTransactions();
      await seedSupport();
      console.log(`db connect`);
    })
    .catch((err) => {
      console.log(`db error: ${err}`);
      process.exit();
    });
});
