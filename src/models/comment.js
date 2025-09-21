module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define(
    "Comment",
    {
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      comment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ledgerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "comments",
      indexes: [
        {
          // 한 유저가 한 날짜에 하나의 댓글만 작성, 다른 유저는 작성 가능
          unique: true,
          // ledgerId + comment_date + userId 의 조합이 중복되면 안됨
          fields: ["ledgerId", "comment_date", "userId"],
        },
      ],
    }
  );

  Comment.associate = function (models) {
    Comment.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user_comments",
    });

    Comment.belongsTo(models.Ledger, {
      foreignKey: "ledgerId",
      as: "ledger_comments",
    });
  };
  return Comment;
};
