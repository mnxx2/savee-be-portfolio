const models = require("../models");
const { generateInviteCode, sendMail } = require("../utils/emailAuth");

const createInviteAndSend = async (email, ledgerId, ownerId) => {
  const user = await models.User.findByPk(ownerId);

  if (!user) {
    return { status: 404, message: "사용자 정보를 확인할 수 없습니다." };
  }

  const ledger = await models.Ledger.findByPk(ledgerId);

  if (!ledger) {
    return { status: 404, message: "해당 가계부를 찾을 수 없습니다." };
  }

  if (!ledger.is_shared) {
    return { status: 404, message: "공유 가계부가 아닙니다." };
  }

  // 중복되지 않는 초대 코드 생성
  let code;
  let exists;

  do {
    code = generateInviteCode();
    exists = await models.InviteCode.findOne({ where: { code } });
  } while (exists);

  // 초대 코드 저장
  // 만료일은 생성일로부터 7일 후
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invite = await models.InviteCode.create({
    code,
    ledgerId,
    userId: ownerId,
    invitedEmail: email,
    expiresAt,
  });

  // 이메일 전송
  await sendMail({
    toEmail: email,
    type: "invite",
    payload: { code, ledger: ledger.name },
  });

  return {
    status: 200,
    message: "초대 코드 이메일을 발송했습니다.",
    data: { toEmail: email, expiresAt },
  };
};

// 초대 수락
const acceptInvite = async (code, email, memberId) => {
  const invite = await models.InviteCode.findOne({ where: { code } });

  // 초대 코드 유효성
  if (!invite) {
    return { status: 404, message: "유효하지 않은 초대 코드입니다." };
  }

  // 초대 코드 사용 유무
  if (invite.isUsed) {
    return { status: 404, message: "이미 사용된 초대 코드입니다." };
  }

  // 유효기간 만료
  if (new Date() > invite.expiresAt) {
    return { status: 404, message: "초대 코드가 만료되었습니다." };
  }

  // 이메일 일치 여부(초대한 이메일과 로그인 사용자 이메일 비교)
  if (invite.invitedEmail !== email) {
    return {
      status: 404,
      message: "초대 이메일과 로그인 이메일이 일치하지 않습니다.",
    };
  }

  // 이미 멤버인지 확인
  const existingMember = await models.LedgerMember.findOne({
    where: { ledgerId: invite.ledgerId, userId: memberId },
  });

  if (existingMember) {
    return { status: 404, message: "이미 멤버로 등록되어 있습니다." };
  }

  // 멤버 생성
  await models.LedgerMember.create({
    ledgerId: invite.ledgerId,
    userId: memberId,
    role: "member",
  });

  // 초대 코드 사용 처리
  invite.isUsed = true;
  await invite.save();

  return {
    status: 200,
    message: "공유 가계부 멤버가 등록되었습니다.",
  };
};

module.exports = {
  createInviteAndSend,
  acceptInvite,
};
