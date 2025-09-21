const jwt = require("jsonwebtoken");
const redisClient = require("../utils/redisClient");

// Jwt 유효성 검증
const authenticate = async (req, res, next) => {
  let token;
  if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return res.status(401).json({ message: "토큰이 없습니다." });
  }
  // 토큰 검증
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
    }
    req.user = user;
    next();
  });
};

// 블랙리스트 확인
const checkBlacklist = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "토큰이 없습니다." });
  }

  try {
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ message: "이미 로그아웃 된 토큰입니다." });
    }
    next();
  } catch (error) {
    console.error("Redis 블랙리스트 확인 에러: ", error);
    return res.status(500).json({ message: "서버 오류" });
  }
};

module.exports = {
  authenticate,
  checkBlacklist,
};
