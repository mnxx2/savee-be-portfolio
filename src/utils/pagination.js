const { Op } = require("sequelize");
const models = require("../models");
async function paginate(model, query, options = {}) {
  // query: req.query (page, pageSize, keyword 등)
  // options: 추가 where 조건 등
  const page = parseInt(query.page, 10) || 1;
  const pageSize = parseInt(query.pageSize, 10) || 10;
  const offset = (page - 1) * pageSize;

  // 키워드 검색 조건 처리
  let whereCondition = options.where || {};
  if (query.keyword) {
    whereCondition.title = { [Op.like]: `%${query.keyword}%` };
  }

  // qna_type이 빈 문자열이면 필터 안 함
  if (query.qna_type && query.qna_type.trim() !== "") {
    whereCondition.qna_type = query.qna_type.trim();
  }

  // 총 개수 조회
  const totalItems = await model.count({ where: whereCondition });

  // 데이터 조회
  const items = await model.findAll({
    where: whereCondition,
    limit: pageSize,
    offset,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: models.User, // 관계 설정된 User 모델
        as: "user",
        attributes: ["name"], // 필요한 필드만
      },
    ],
    ...options.findAllOptions, // 추가 옵션 전달 가능
  });

  const totalPages = Math.ceil(totalItems / pageSize);
  return {
    items,
    pagination: {
      currentPage: page,
      pageSize,
      totalItems,
      totalPages,
    },
  };
}

module.exports = paginate;
