module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          is: {
            args: /^[^\s]+$/, // 공백 불가
            msg: "이름에 공백은 허용되지 않습니다.",
          },
        },
      },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      role: {
        type: DataTypes.ENUM("user", "admin"),
        defaultValue: "user",
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    { tableName: "users" }
  );
  User.associate = function (models) {
    User.hasMany(models.SupportPost, {
      foreignKey: "userId",
      as: "user_posts",
    });

    User.hasMany(models.EmailVerification, {
      foreignKey: "userId",
    });

    User.hasMany(models.Ledger, {
      foreignKey: "userId",
      as: "user_ledgers",
    });

    User.hasMany(models.LedgerMember, {
      foreignKey: "userId",
      as: "user_ledgermembers",
    });

    User.hasMany(models.Comment, {
      foreignKey: "userId",
      as: "user_comments",
    });

    User.hasMany(models.AnalysisResult, {
      foreignKey: "userId",
      as: "user_analysisresults",
    });

    User.hasMany(models.InviteCode, {
      foreignKey: "userId",
      as: "user_invitecodes",
    });
    User.hasMany(models.Qna, {
      foreignKey: "userId",
      as: "user_Qnas",
    });
    User.hasMany(models.Transaction, {
      foreignKey: "userId",
      as: "user_transactions",
    });
  };
  return User;
};
