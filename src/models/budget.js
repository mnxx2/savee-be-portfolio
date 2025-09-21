module.exports = (sequelize, DataTypes) => {
  const Budget = sequelize.define(
    "Budget",
    {
      year: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      month: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      limit_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ledgerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    { tableName: "budgets" }
  );

  Budget.associate = function (models) {
    Budget.belongsTo(models.Ledger, {
      foreignKey: "ledgerId",
      as: "ledger_budgets",
    });

    Budget.belongsTo(models.Category, {
      foreignKey: "categoryId",
      as: "category_budgets",
    });
  };

  return Budget;
};
