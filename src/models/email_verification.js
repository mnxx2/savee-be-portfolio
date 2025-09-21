module.exports = (sequelize, DataTypes) => {
  const EmailVerification = sequelize.define(
    "EmailVerification",
    {
      code: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false },
      expiresAt: { type: DataTypes.DATE, allowNull: false },
      isUsed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    { tableName: "email_verifications" }
  );
  // EmailVerification.associate = function (models) {
  //   EmailVerification.belongsTo(models.User, {
  //     foreignKey: "userId",
  //     as: "user",
  //   });
  // };
  return EmailVerification;
};
