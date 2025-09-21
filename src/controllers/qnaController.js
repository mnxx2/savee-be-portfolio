const models = require("../models");
const { Op } = require("sequelize");
const paginate = require("../utils/pagination");

//질문 추가
const createQna = async (req, res) => {
  const { title, question, qna_type } = req.body;
  if (!title || title.trim() == "" || !question || question.trim() == "") {
    return res.status(400).json({ message: "빈 값은 등록 할 수 없습니다." });
  }
  const qna = await models.Qna.create({
    title,
    question,
    qna_type,
    userId: req.user.id,
  });
  return res.status(201).json({ message: "질문이 등록되었습니다.", data: qna });
};

//질문 수정(only 작성자)
const updateQna = async (req, res) => {
  const { title, question, qna_type } = req.body;
  const id = req.params.id;
  const qna = await models.Qna.findByPk(id);
  const userId = req.user.id;
  // 작성자 본인인지 확인
  if (qna.userId !== userId) {
    return res.status(403).json({ message: "작성자만 수정할 수 있습니다." });
  }
  if (qna) {
    if (title) qna.title = title;
    if (question) qna.question = question;
    if (qna_type) qna.qna_type = qna_type;
    await qna.save();
    return res
      .status(200)
      .json({ message: "질문 수정이 완료되었습니다.", data: qna });
  } else {
    return res.status(404).json({ message: "질문이 없습니다." });
  }
};
const findAllQna = async (req, res) => {
  try {
    // req.query.qna_type가 빈 문자열이라면 조건에 안 넣음
    const options = {};

    if (req.query.qna_type && req.query.qna_type.trim() !== "") {
      options.where = { qna_type: req.query.qna_type.trim() };
    }

    const { items: data, pagination } = await paginate(
      models.Qna,
      req.query,
      options
    );

    return res.status(200).json({
      message: "전체 질문 목록을 조회 합니다.",
      data: { data, pagination },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

//질문 id 조회
const findByid = async (req, res) => {
  const id = req.params.id;
  const qna = await models.Qna.findByPk(id);
  if (!qna) {
    return res
      .status(200)
      .json({ message: "질문을 조회하지 못했습니다.", data: qna });
  }
  return res.status(200).json({ message: "질문을 조회 합니다.", data: qna });
};

//질문 제목 조회
const findBytitle = async (req, res) => {
  const title = req.query.title;
  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "검색어는 필수입니다." });
  }

  const qnas = await models.Qna.findAll({
    where: {
      title: {
        [Op.iLike]: `%${title}%`, //대소문자 무시
      },
    },
  });

  if (!qnas || qnas.length === 0) {
    return res.status(200).json({ message: "검색 결과가 없습니다.", data: [] });
  }
  return res
    .status(200)
    .json({ message: `${title} 검색 결과 입니다.`, data: qnas });
};

//나의 질문 조회
const findMyqna = async (req, res) => {
  const userId = req.user.id;
  const options = {
    findAllOptions: {
      where: { userId: req.user.id }, // 여기서 내 ID만 조건
      order: [["createdAt", "DESC"]],
    },
  };
  const { items: data, pagination } = await paginate(
    models.Qna,
    req.query,
    options
  );
  // const qnas = await models.Qna.findAll({
  //   where: { userId },
  //   order: [["createdAt", "DESC"]],
  // });
  if (!data || data.length === 0) {
    return res.status(200).json({ message: "검색 결과가 없습니다.", data: [] });
  }
  return res.status(200).json({
    message: `내가 작성한 질문 목록 입니다.`,
    data: { data, pagination },
  });
};

//질문 삭제(only 작성자, admin)
const deleteQna = async (req, res) => {
  const id = req.params.id;
  const qna = await models.Qna.findByPk(id);
  if (req.user.role != "admin") {
    if (qna.userId != id) {
      return res.status(403).json({ message: "삭제 권한이 없습니다." });
    }
  }
  const result = await models.Qna.destroy({ where: { id: id } });

  if (result) {
    return res.status(200).json({ message: "질문이 삭제되었습니다." });
  } else {
    return res.status(404).json({ message: "질문이 없습니다." });
  }
};

module.exports = {
  createQna,
  findAllQna,
  findBytitle,
  findByid,
  findMyqna,
  updateQna,
  deleteQna,
};
