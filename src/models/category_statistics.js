module.exports = (sequelize, DataTypes) => {
  const CategoryStatistics = sequelize.define(
    "CategoryStatistics",
    {
      week: { type: DataTypes.INTEGER },
      month: { type: DataTypes.INTEGER },
      totalAmount: { type: DataTypes.INTEGER },
    },
    { tableName: "category_statistics" }
  );
  CategoryStatistics.associate = function (models) {
    CategoryStatistics.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };
  CategoryStatistics.associate = function (models) {
    CategoryStatistics.belongsTo(models.Ledger, {
      foreignKey: "ledgerId",
      as: "ledger",
    });
  };
  CategoryStatistics.associate = function (models) {
    CategoryStatistics.belongsTo(models.Category, {
      foreignKey: "categoryId",
      as: "category",
    });
  };
  return CategoryStatistics;
};
