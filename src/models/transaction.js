module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define(
    "Transaction",
    {
      type: {
        type: DataTypes.ENUM("income", "expense"),
        defaultValue: "expense",
        allowNull: false,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      memo: {
        type: DataTypes.TEXT,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    { tableName: "transactions" }
  );

  Transaction.associate = function (models) {
    Transaction.belongsTo(models.Ledger, {
      foreignKey: "ledgerId",
      as: "ledger_transactions",
    });

    Transaction.belongsTo(models.Category, {
      foreignKey: "categoryId",
      as: "category_transactions",
    });

    Transaction.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user_transactions",
    });
  };
  return Transaction;
};
