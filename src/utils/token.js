const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign(
    // 페이로드 (토큰에 담길 유저 정보)
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const getTokenExpiration = (token) => {
  const decoded = jwt.decode(token);
  return decoded?.exp;
};

module.exports = { generateAccessToken, getTokenExpiration };
