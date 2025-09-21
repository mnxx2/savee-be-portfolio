const authService = require("../services/authService");

const sendVerificationCode = async (req, res) => {
  const email = req.body.email;
  if (!email) {
    return res.status(400).json({ error: "이메일을 입력하세요." });
  }
  try {
    const result = await authService.verifyEmail(email);
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "인증번호 발송 중 오류 발생";
    res.status(status).json({ error: message });
  }
};

const confirmCode = async (req, res) => {
  const { email, code } = req.body;
  if (!email) {
    return res.status(400).json({ error: "이메일을 입력하세요." });
  }
  if (!code) {
    return res.status(400).json({ error: "인증번호를 입력하세요." });
  }
  try {
    const result = await authService.verifyCode(email, code);
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "인증번호 확인 중 오류 발생";
    res.status(status).json({ error: message });
  }
};

const signup = async (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({ error: "모든 정보를 입력해주세요." });
  }
  try {
    const result = await authService.signup(email, name, password);
    res.status(201).json(result);
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "회원가입 중 오류 발생";
    res.status(status).json({ error: message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "로그인 중 오류가 발생했습니다.";
    res.status(status).json({ error: message });
  }
};

const logout = async (req, res) => {
  // token = req.headers.authorization.split(" ")[1];
  const accessToken = req.headers.authorization?.split(" ")[1];
  if (!accessToken) {
    return res.status(400).json({ error: "토큰이 없습니다." });
  }
  await authService.logout(accessToken);
  res.status(200).json({ message: "로그아웃 되었습니다." });
};

module.exports = {
  sendVerificationCode,
  confirmCode,
  signup,
  login,
  logout,
};
