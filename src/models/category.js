module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      icon_url: {
        type: DataTypes.TEXT,
      },
    },
    { tableName: "categories" }
  );

  Category.associate = function (models) {
    Category.hasMany(models.Transaction, {
      foreignKey: "categoryId",
      as: "category_transactions",
    });

    Category.hasMany(models.Budget, {
      foreignKey: "categoryId",
      as: "category_budgets",
    });

    Category.hasMany(models.Goal, {
      foreignKey: "categoryId",
      as: "category_goals",
    });
  };

  return Category;
};
