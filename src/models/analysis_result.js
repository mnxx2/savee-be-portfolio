module.exports = (sequelize, DataTypes) => {
  const AnalysisResult = sequelize.define(
    "AnalysisResult",
    {
      comment_datesummary: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      strategy: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    { tableName: "analysis_results" }
  );

  AnalysisResult.associate = function (models) {
    AnalysisResult.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user_analysisresults",
    });

    AnalysisResult.belongsTo(models.Ledger, {
      foreignKey: "ledgerId",
      as: "ledger_analysisresults",
    });
  };
  return AnalysisResult;
};
