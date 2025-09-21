const models = require("../models");
const bcrypt = require("bcrypt");
const {
  generateCode,
  sendMail,
  generateTempPw,
} = require("../utils/emailAuth");
const { Op } = require("sequelize");

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await models.User.findByPk(userId);
  if (!user) {
    const error = new Error("사용자를 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    const error = new Error("기존 비밀번호를 다시 확인해주세요.");
    error.status = 400;
    throw error;
  }
  const isSameAsCurrent = await bcrypt.compare(newPassword, user.password);
  if (isSameAsCurrent) {
    const error = new Error("비밀번호 변경에 실패했습니다.");
    error.status = 400;
    error.code = "PASSWORD_SAME";
    throw error;
  }
  const hashedNewPw = await bcrypt.hash(newPassword, 10);
  user.password = hashedNewPw;
  await user.save();
  return { message: "비밀번호가 성공적으로 변경되었습니다." };
};

const changeName = async (userId, name) => {
  const user = await models.User.findByPk(userId);
  // 이름에 공백 불가
  if (/\s/.test(name)) {
    const error = new Error("이름에 공백은 허용되지 않습니다.");
    error.status = 400;
    throw error;
  }
  if (!user) {
    const error = new Error("사용자를 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }
  if (user.name === name) {
    const error = new Error(
      "기존 이름과 동일합니다. 새로운 이름을 입력해주세요."
    );
    error.status = 400;
    throw error;
  }
  user.name = name;
  await user.save();
  return { message: "이름을 변경하였습니다." };
};

// 비밀번호 찾기용 인증 메일 발송
const sendPasswordCode = async (email) => {
  // 회원 조회
  const user = await models.User.findOne({
    where: { email },
  });
  // 없다면 에러 반환
  if (!user) {
    const error = new Error("입력한 정보가 일치하지 않습니다.");
    error.status = 404;
    throw error;
  }
  // 새 인증번호 생성
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10분 후
  const emailVerification = await models.EmailVerification.create({
    code,
    email,
    expiresAt,
  });
  // 메일 전송
  await sendMail({
    toEmail: email,
    type: "resetPassword",
    payload: { code, toEmail: email },
  });
  return {
    message: "이메일이 전송되었습니다.",
    expiresAt: emailVerification.expiresAt,
    email: emailVerification.email,
  };
};

const findPassword = async (email) => {
  // 1. 회원조회
  const user = await models.User.findOne({
    where: { email },
  });
  if (!user) {
    const error = new Error("입력한 정보가 일치하지 않습니다.");
    error.status = 404;
    throw error;
  }
  // 2. 인증번호 검증된 상태인지 확인
  const verifyInfo = await models.EmailVerification.findOne({
    where: { email: email },
    order: [["createdAt", "DESC"]],
  });
  if (!verifyInfo || !verifyInfo.isUsed) {
    const error = new Error("이메일 인증이 필요합니다.");
    error.status = 403;
    throw error;
  }
  // 3. 임시 비밀번호 생성
  const tempPassword = generateTempPw();
  const hashedNewPw = await bcrypt.hash(tempPassword, 10);
  // 4. 비밀번호 변경
  user.password = hashedNewPw;
  await user.save();
  return {
    message: "비밀번호가 임시 비밀번호로 재설정되었습니다.",
    tempPassword,
    name: user.name,
  };
};

const deleteUser = async (userId, enteredEmail, enteredPassword) => {
  const user = await models.User.findByPk(userId);
  if (!user) {
    const error = new Error("회원 정보를 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }
  if (user.email !== enteredEmail) {
    const error = new Error(
      "입력한 이메일이 현재 로그인된 계정과 일치하지 않습니다."
    );
    error.status = 403;
    throw error;
  }
  const isMatch = await bcrypt.compare(enteredPassword, user.password);
  if (!isMatch) {
    const error = new Error("비밀번호가 일치하지 않습니다.");
    error.status = 400;
    throw error;
  }
  // 공유 가계부에 속한 회원의 탈퇴 처리
  // 1. 탈퇴하려는 유저가 소유한 (공유)가계부 조회
  const ownedLedgers = await models.Ledger.findAll({ where: { userId } });

  for (const ledger of ownedLedgers) {
    // 소유주 위임할 멤버 찾기
    const otherMembers = await models.LedgerMember.findAll({
      where: { ledgerId: ledger.id, userId: { [Op.ne]: userId } },
      // Op.ne : not equal 같지 않음 -> userId와 같지 않은 유저 조회
    });
    if (otherMembers.length > 0) {
      // 다른 멤버가 있다면 첫 번째에 소유권 위임
      const newOwner = otherMembers[0];
      await ledger.update({ userId: newOwner.userId });
    } else {
      // 다른 멤버가 없으면 가계부 삭제
      await ledger.destroy();
    }
  }
  // 2. 가계부 멤버에서 해당 유저 삭제
  await models.LedgerMember.destroy({
    where: { userId },
  });

  await models.User.destroy({
    where: { id: userId },
  });
  return { message: "정상적으로 탈퇴되었습니다." };
};

const getUserInfo = async (userId) => {
  const user = await models.User.findByPk(userId);
  if (!user) {
    const error = new Error("회원 정보를 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }
  return { name: user.name, email: user.email };
};

module.exports = {
  changePassword,
  changeName,
  sendPasswordCode,
  findPassword,
  deleteUser,
  getUserInfo,
};
