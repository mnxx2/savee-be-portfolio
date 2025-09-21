const { Op } = require("sequelize");
const models = require("../models");

// 댓글 추가
const addComments = async (userId, ledgerId, content, comment_date) => {
  try {
    const { success, status, message } = await validateUserAndLedger(
      userId,
      ledgerId
    );
    if (!success) return { status, message };

    let formattedDate = null;

    // 해당 날짜에 내역이 있는지 확인
    if (comment_date) {
      const cdate = new Date(comment_date);
      const year = cdate.getFullYear();
      const month = String(cdate.getMonth() + 1).padStart(2, "0");
      const day = String(cdate.getDate()).padStart(2, "0");

      formattedDate = `${year}-${month}-${day}`;

      const transac = await models.Transaction.findAll({
        where: {
          ledgerId,
          date: formattedDate,
        },
      });

      if (transac.length === 0) {
        return {
          status: 404,
          message: "해당 날짜에 댓글을 작성할 수 있는 내역이 없습니다.",
        };
      }
    }

    // 이미 작성한 댓글이 있는지 확인
    const existing = await models.Comment.findOne({
      where: { userId, ledgerId, comment_date: formattedDate },
    });

    if (existing) {
      return {
        status: 400,
        message: "이미 해당 날짜에 작성한 댓글이 있습니다.",
      };
    }

    const comment = await models.Comment.create({
      userId,
      ledgerId,
      content,
      comment_date: formattedDate,
    });

    return {
      status: 200,
      message: "해당 날짜에 댓글을 작성했습니다.",
      data: comment,
    };
  } catch (error) {
    throw error;
  }
};

// 댓글 수정
const updateComment = async (userId, ledgerId, commentId, content) => {
  try {
    const { success, status, message } = await validateUserAndLedger(
      userId,
      ledgerId,
      commentId
    );
    if (!success) return { status, message };

    const comment = await models.Comment.findOne({
      where: { userId, ledgerId, id: commentId },
    });

    if (comment) {
      if (content) comment.content = content;
    }

    comment.save();

    return {
      status: 200,
      message: "해당 댓글을 수정했습니다.",
      data: comment,
    };
  } catch (error) {
    throw error;
  }
};

// 댓글 목록 조회 : 쿼리로 특정 날짜를 검색할 수 있지만 사용하지 않으면 댓글이 있는 전체 목록
const getComments = async (userId, ledgerId, commentId, date) => {
  try {
    const { success, status, message } = await validateUserAndLedger(
      userId,
      ledgerId,
      commentId
    );

    if (!success) return { status, message };

    // date가 있으면 해당 날짜의 유저별 수입/지출 내역 + 댓글, 없으면 날짜별 -> 유저별 수입/지출 내역 + 댓글
    // date가 있으면 날짜필터에 객체화, 없으면 전체 출력

    let transactions = [];
    if (!date) {
      transactions = await models.Transaction.findAll({
        where: { ledgerId },
        include: [
          {
            model: models.User,
            as: "user_transactions",
            attributes: ["id", "name"],
          },
          {
            model: models.Category,
            as: "category_transactions",
            attributes: ["name"],
          },
        ],
        order: [["date", "DESC"]],
      });
    } else {
      const [yearStr, monthStr] = date.split("-");
      const year = Number(yearStr);
      const month = Number(monthStr);

      // 날짜 유효성 검사
      if (!year || !month || month < 1 || month > 12) {
        return {
          status: 400,
          message: "유효하지 않은 날짜 형식입니다. (YYYY-MM)",
        };
      }

      // month는 0부터 시작 → 다음 달의 0일 = 이번 달 마지막 날
      const lastDate = new Date(year, month, 1);
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = lastDate.toISOString().split("T")[0];

      transactions = await models.Transaction.findAll({
        where: {
          ledgerId,
          date: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: [
          {
            model: models.User,
            as: "user_transactions",
            attributes: ["id", "name"],
          },
          {
            model: models.Category,
            as: "category_transactions",
            attributes: ["name"],
          },
        ],
        order: [["date", "DESC"]],
      });
    }

    // 같은 날짜에 대한 댓글 한번에 모으기
    // 수입/지출 내역에서 날짜(transac.date)를 추출하고, 중복을 제거한 배열 -> 특정 날짜의 댓글 가져오기
    const commentDates = [...new Set(transactions.map((ts) => ts.date))];

    if (commentDates.length === 0) {
      return {
        status: 404,
        message: "해당 조건에 맞는 내역이 없습니다.",
      };
    }

    const comments = await models.Comment.findAll({
      where: { ledgerId, comment_date: commentDates },
      include: [
        { model: models.User, as: "user_comments", attributes: ["id", "name"] },
        { model: models.Ledger, as: "ledger_comments", attributes: ["name"] },
      ],
    });

    // 각 날짜별 내역 + 댓글 묶기
    const group = {};

    // 날짜별로 내역 그룹핑
    // group객체는 날짜를 키로 사용해 각 날짜에 해당하는 수입/지출 내역과 댓글 저장
    for (const transac of transactions) {
      if (!group[transac.date]) {
        group[transac.date] = {
          transactions: [],
          comments: [],
        };
      }

      // 날짜별 거래 내역 저장
      group[transac.date].transactions.push(transac);
    }

    // 날짜별 댓글 그룹핑
    for (const cm of comments) {
      if (!group[cm.comment_date]) {
        group[cm.comment_date] = {
          transactions: [],
          comments: [],
        };
      }

      // 중복된 댓글이 추가되지 않도록 확인
      if (
        !group[cm.comment_date].comments.some(
          (existing) => existing.id === cm.id
        )
      ) {
        group[cm.comment_date].comments.push(cm);
      }
    }
    // 유저별로 날짜에 따른 내역과 댓글 그룹화
    // 최종 결과 배열로 반환
    const result = [];

    for (const date in group) {
      const dateEntry = group[date];
      const userMap = {};

      // 거래 내역 기준 유저 그룹화
      for (const transac of dateEntry.transactions) {
        const uid = transac.userId;
        if (!userMap[uid]) {
          userMap[uid] = {
            user: transac.user_transactions,
            transactions: [],
            comments: [],
          };
        }
        userMap[uid].transactions.push(transac);
      }

      // 댓글 기준 유저 그룹화
      for (const cm of dateEntry.comments) {
        const uid = cm.userId;
        if (!userMap[uid]) {
          userMap[uid] = {
            user: cm.user_comments,
            transactions: [],
            comments: [],
          };
        }
        userMap[uid].comments.push(cm);
      }

      result.push({
        date,
        users: Object.values(userMap),
      });
    }

    return {
      status: 200,
      message: date
        ? `${date}의 내역 및 댓글 목록을 가져왔습니다.`
        : "전체 날짜의 내역 및 댓글 목록을 가져왔습니다.",
      data: result,
    };
  } catch (error) {
    throw error;
  }
};

// 댓글 상세 조회
const findComment = async (userId, ledgerId, commentId) => {
  try {
    const { success, status, message } = await validateUserAndLedger(
      userId,
      ledgerId,
      commentId
    );
    if (!success) return { status, message };

    const comment = await models.Comment.findByPk(commentId);

    return {
      status: 200,
      message: "해당 댓글의 정보를 가져왔습니다.",
      data: comment,
    };
  } catch (error) {
    throw error;
  }
};

// 댓글 삭제
const deleteComment = async (userId, ledgerId, commentId) => {
  try {
    const { success, status, message } = await validateUserAndLedger(
      userId,
      ledgerId,
      commentId
    );
    if (!success) return { status, message };

    const comment = await models.Comment.findByPk(commentId);

    if (comment.userId !== userId) {
      return {
        status: 404,
        message: "타인의 댓글은 삭제할 수 없습니다.",
      };
    } else {
      await comment.destroy();

      return {
        status: 200,
        message: "해당 댓글을 삭제했습니다.",
      };
    }
  } catch (error) {
    throw error;
  }
};

const validateUserAndLedger = async (userId, ledgerId, commentId) => {
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
  const ledger = await models.Ledger.findByPk(ledgerId);

  if (!ledger) {
    return {
      success: false,
      status: 404,
      message: "해당 가계부를 찾을 수 없습니다.",
    };
  }

  // 공유 가계부인지 검증
  if (!ledger.is_shared) {
    return {
      success: false,
      status: 404,
      message: "공유 가계부에만 댓글을 작성할 수 있습니다.",
    };
  }

  // 가계부의 멤버이거나 소유자인지 확인
  // 소유자
  const isOwner = ledger.userId === userId;
  // 멤버
  const isMember = await models.LedgerMember.findOne({
    where: { ledgerId, userId },
  });

  // 소유자도 아니고 멤버도 아니면 접근 제한
  if (!isOwner && !isMember) {
    return {
      success: false,
      status: 404,
      message: "가계부에 접근할 권한이 없습니다.",
    };
  }

  // 해당 댓글이 가계부에 속하는지 확인
  if (commentId) {
    const comment = await models.Comment.findByPk(commentId);
    if (!comment) {
      return {
        success: false,
        status: 404,
        message: "해당 댓글을 찾을 수 없습니다.",
      };
    }

    if (comment.ledgerId !== Number(ledgerId)) {
      return {
        success: false,
        status: 404,
        message: "해당 댓글을 가계부에서 찾을 수 없습니다.",
      };
    }
  }

  return { success: true, status: 200, user, ledger };
};

module.exports = {
  addComments,
  updateComment,
  getComments,
  findComment,
  deleteComment,
};
