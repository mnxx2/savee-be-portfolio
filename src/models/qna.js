const { ENUM, Association } = require("sequelize");

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
  Qna.associate = function (models) {
    Qna.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };
  return Qna;
};
