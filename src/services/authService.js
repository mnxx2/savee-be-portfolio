const models = require("../models");
const bcrypt = require("bcrypt");
const { generateAccessToken, getTokenExpiration } = require("../utils/token");
const redisClient = require("../utils/redisClient");
const { generateCode, sendMail } = require("../utils/emailAuth");
const { Op } = require("sequelize");

// 회원가입을 위한 인증번호 이메일 발송
const verifyEmail = async (email) => {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const error = new Error("유효하지 않은 이메일 주소입니다.");
    error.status = 400;
    throw error;
  }
  const user = await models.User.findOne({
    where: { email: email },
  });
  if (user) {
    const error = new Error("이미 가입된 이메일 입니다.");
    error.status = 409;
    throw error;
  }
  // 만료 전인 이전 인증번호 무효화 처리 필요
  await models.EmailVerification.update(
    { isUsed: true },
    {
      where: {
        email,
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() }, // Sequelize에서 조건문(where절) WHERE expiresAt > NOW()의 역할
        // Op.gt : greater than (>)
      },
    }
  );

  // 새 인증번호 생성 및 저장
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10분 후
  const emailVerification = await models.EmailVerification.create({
    email,
    code,
    expiresAt,
  });
  await sendMail({
    toEmail: email,
    type: "signup",
    payload: { code, toEmail: email },
  });
  return {
    message: "이메일이 전송되었습니다.",
    expiresAt: emailVerification.expiresAt,
    email: emailVerification.email,
  };
};

// 인증 번호 확인
const verifyCode = async (email, enteredCode) => {
  const verifyInfo = await models.EmailVerification.findOne({
    where: { email: email },
    order: [["createdAt", "DESC"]],
  });
  if (!verifyInfo) {
    const error = new Error("인증 요청이 없습니다.");
    error.status = 400;
    throw error;
  }

  if (verifyInfo.code !== enteredCode) {
    const error = new Error("인증번호가 일치하지 않습니다.");
    error.status = 422;
    throw error;
  }
  // 사용되었거나 만료된 코드인지 확인
  if (verifyInfo.isUsed) {
    const error = new Error("이미 사용된 인증번호 입니다.");
    error.status = 409;
    throw error;
  }
  if (new Date() > verifyInfo.expiresAt) {
    const error = new Error("인증 시간이 만료되었습니다.");
    error.status = 410;
    throw error;
  }

  verifyInfo.isUsed = true;
  await verifyInfo.save();
  return { message: "인증이 완료되었습니다." };
};

const signup = async (email, name, password) => {
  try {
    // 이름에 공백 불가
    if (/\s/.test(name)) {
      const error = new Error("이름에 공백은 허용되지 않습니다.");
      error.status = 400;
      throw error;
    }
    // 이메일 인증 정보 먼저 확인
    const verifyInfo = await models.EmailVerification.findOne({
      where: { email: email },
      order: [["createdAt", "DESC"]],
    });
    if (!verifyInfo || !verifyInfo.isUsed) {
      const error = new Error("이메일 인증이 필요합니다.");
      error.status = 403;
      throw error;
    }
    const hashedPw = await bcrypt.hash(password, 10);
    const user = await models.User.create({
      email: email,
      name: name,
      password: hashedPw,
    });

    await models.Ledger.create({
      name: `${name}의 가계부`,
      userId: user.id,
    });

    return {
      message: `${user.name}님 회원가입에 성공했습니다.`,
      user: { id: user.id, email },
    };
  } catch (error) {
    throw error;
  }
};

const login = async (email, password) => {
  const user = await models.User.findOne({
    where: { email: email },
  });
  if (!user) {
    const error = new Error("등록된 사용자가 없습니다.");
    error.status = 401;
    throw error;
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("이메일 또는 비밀번호가 일치하지 않습니다.");
    error.status = 401;
    throw error;
  }

  const accessToken = generateAccessToken(user);
  return {
    message: `로그인 성공. ${user.name}님 환영합니다!`,
    accessToken: accessToken,
    user: { id: user.id },
  };
};

const logout = async (accessToken) => {
  // 1. accessToken 에서 만료 시간 추출
  const exp = getTokenExpiration(accessToken);
  // 현재 시각
  const now = Math.floor(Date.now() / 1000);
  // 만료까지 남은 시간 계산
  const ttl = exp - now;
  // 2. Redis에서 블랙리스트로 저장 (EX: 몇 초 후 만료)
  await redisClient.set(`blacklist:${accessToken}`, "blacklisted", { EX: ttl });
};

module.exports = {
  verifyEmail,
  verifyCode,
  signup,
  login,
  logout,
};
