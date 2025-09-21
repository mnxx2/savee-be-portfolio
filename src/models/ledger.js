module.exports = (sequelize, DataTypes) => {
  const Ledger = sequelize.define(
    "Ledger",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_shared: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    { tableName: "ledgers" }
  );

  Ledger.associate = function (models) {
    Ledger.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user_ledgers",
    });

    Ledger.hasMany(models.LedgerMember, {
      foreignKey: "ledgerId",
      as: "ledger_ledgermembers",
    });

    Ledger.hasMany(models.Transaction, {
      foreignKey: "ledgerId",
      as: "ledger_transactions",
    });

    Ledger.hasMany(models.Comment, {
      foreignKey: "ledgerId",
      as: "ledger_comments",
    });

    Ledger.hasMany(models.AnalysisResult, {
      foreignKey: "ledgerId",
      as: "ledger_analysisresults",
    });

    Ledger.hasMany(models.Budget, {
      foreignKey: "ledgerId",
      as: "ledger_budgets",
    });

    Ledger.hasMany(models.InviteCode, {
      foreignKey: "ledgerId",
      as: "ledger_invitecodes",
    });

    Ledger.hasMany(models.Goal, {
      foreignKey: "ledgerId",
      as: "ledger_goals",
    });
  };
  return Ledger;
};
