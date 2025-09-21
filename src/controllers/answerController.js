const models = require("../models");
const { Op } = require("sequelize");

//답변 등록
const addAnswer = async (req, res) => {
  const { answer } = req.body;
  const id = req.params.id;
  const qna = await models.Qna.findByPk(id);

  if (qna) {
    // if (qna.iscompleted == true) {
    //   return res
    //     .status(400)
    //     .json({ message: "이미 답변이 등록 된 질문입니다." });
    // }
    if (!answer || answer.trim() == "") {
      res.status(400).json({ message: "빈 답변은 등록 할 수 없습니다." });
    } else {
      qna.answer = answer;
      qna.iscompleted = true;
    }
    await qna.save();
    return res
      .status(200)
      .json({ message: "답변이 등록되었습니다.", data: qna });
  } else {
    return res.status(404).json({ message: "질문이 없습니다." });
  }
};
//답변 취소
const deleteAnswer = async (req, res) => {
  const { answer } = req.body;
  const id = req.params.id;
  const qna = await models.Qna.findByPk(id);

  if (qna) {
    if (qna.iscompleted != true || !qna.answer) {
      return res.status(400).json({ message: "등록된 답변이 없습니다." });
    }
    qna.iscompleted = false;
    await qna.save();
    return res
      .status(200)
      .json({ message: "답변이 삭제되었습니다.", data: qna });
  } else {
    return res.status(404).json({ message: "질문이 없습니다." });
  }
};
//답변 수정
const updateAnswer = async (req, res) => {
  const { answer } = req.body;
  const id = req.params.id;
  const qna = await models.Qna.findByPk(id);

  if (qna) {
    if (qna.iscompleted != true || !qna.answer) {
      return res.status(400).json({ message: "등록된 답변이 없습니다." });
    }
    if (!answer || answer.trim() == "") {
      res.status(400).json({ message: "빈 답변은 등록 할 수 없습니다." });
    } else {
      qna.answer = answer;
    }
    await qna.save();
    return res
      .status(200)
      .json({ message: "답변을 수정하였습니다.", data: qna });
  } else {
    return res.status(404).json({ message: "질문이 없습니다." });
  }
};
module.exports = {
  addAnswer,
  updateAnswer,
  deleteAnswer,
};
