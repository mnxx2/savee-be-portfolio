module.exports = (sequelize, DataTypes) => {
  const Goal = sequelize.define(
    "Goal",
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      target_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      current_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      start_date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
      },
      end_date: {
        type: DataTypes.DATEONLY,
      },
      type: {
        type: DataTypes.ENUM("saving", "spending_cut", "custom"),
        allowNull: false,
        defaultValue: "saving",
      },
      status: {
        type: DataTypes.ENUM("ongoing", "achieved", "failed"),
        allowNull: false,
        defaultValue: "ongoing",
      },
    },
    {
      tableName: "goals",
    }
  );

  Goal.associate = function (models) {
    Goal.belongsTo(models.Ledger, {
      foreignKey: "ledgerId",
      as: "ledger_goals",
    });

    Goal.belongsTo(models.Category, {
      foreignKey: "categoryId",
      as: "category_goals",
    });
  };

  return Goal;
};
