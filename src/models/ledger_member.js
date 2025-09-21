const { ForeignKeyConstraintError } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const LedgerMember = sequelize.define(
    "LedgerMember",
    {
      role: {
        type: DataTypes.ENUM("owner", "member"),
        allowNull: false,
        defaultValue: "owner",
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
    { tableName: "ledger_members" }
  );

  LedgerMember.associate = function (models) {
    LedgerMember.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user_ledgermembers",
    });

    LedgerMember.belongsTo(models.Ledger, {
      foreignKey: "ledgerId",
      as: "ledger_ledgermembers",
    });
  };
  return LedgerMember;
};
