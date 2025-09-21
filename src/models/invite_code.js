module.exports = (sequelize, DataTypes) => {
  const InviteCode = sequelize.define(
    "InviteCode",
    {
      code: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      invitedEmail: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      isUsed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    { tableName: "invite_codes" }
  );

  InviteCode.associate = function (models) {
    InviteCode.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user_invitecodes",
    });

    InviteCode.belongsTo(models.Ledger, {
      foreignKey: "ledgerId",
      as: "ledger_invitecodes",
    });
  };
  return InviteCode;
};
