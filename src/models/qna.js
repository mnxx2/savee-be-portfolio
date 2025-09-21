<<<<<<< HEAD
const { ENUM, Association } = require("sequelize");
=======
const { ENUM } = require("sequelize");
>>>>>>> c590c19 ([250728]1. post,qna 테이블 생성 및 post CRUD 추가)

module.exports = (sequelize, DataTypes) => {
  const Qna = sequelize.define(
    "Qna",
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      question: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
<<<<<<< HEAD
      answer: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      qna_type: {
        type: DataTypes.ENUM(
          "로그인",
          "가계부",
          "소비분석",
          "에러",
          "유저",
          "기타"
        ),
        defaultValue: "로그인",
=======
      qna_type: {
        type: DataTypes.ENUM(
          "login",
          "ledger",
          "analysis",
          "error",
          "user",
          "etc"
        ),
        defaultValue: "login",
>>>>>>> c590c19 ([250728]1. post,qna 테이블 생성 및 post CRUD 추가)
        allowNull: false,
      },
      iscompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    { tableName: "qna" }
  );
<<<<<<< HEAD
  Qna.associate = function (models) {
    Qna.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };
=======
>>>>>>> c590c19 ([250728]1. post,qna 테이블 생성 및 post CRUD 추가)
  return Qna;
};
