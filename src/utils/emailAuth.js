const nodemailer = require("nodemailer");
const crypto = require("crypto");

const generateCode = () => {
  return Math.floor(Math.random() * 900000 + 100000).toString();
};

// 초대 코드 생성
const generateInviteCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
};

const generateTempPw = () => {
  return crypto.randomBytes(5).toString("hex");
};

// mail template 설정
function getMailTemplate(type, payload) {
  const commonStyle = `border-radius: 10px;
        border: 1px solid;
        width: 50%;
        margin: 0 auto;
        text-align: center;
        padding: 1rem 3rem;`;
  switch (type) {
    case "signup":
      return {
        subject: "Savee 회원가입 이메일 인증 요청",
        html: `<div class="box" style="${commonStyle}">
      <h1 style="color: #422ef4;">SAVEE</h2>
      <h2 style="text-align: start; color: #333333;">이메일 인증번호</h4>
      <h3 style="text-align: start;">${payload.toEmail} 계정으로 회원가입하는 데 필요한 인증 코드: </h3>
      <h1 style="background-color: #efefef; color: #5cb0ff; padding: 1rem">${payload.code}</h1>
      <hr/>
      <p style="text-align: start;">이 이메일 계정으로 회원가입하려면 위 인증 코드(이)가 필요합니다. 회원가입을 원하시면 위 인증코드를 인증번호 입력 란에 입력해주시길 바랍니다. 인증코드의 만료 시간은 10분입니다.</p>
    </div>
    <p style="width: 60%; margin: 0 auto; padding: 1rem 0; color: #9a9a9a;">이 이메일은 자동 생성 및 전송되었습니다. 이 이메일에는 답장하지 마세요. 추가적인 도움이 필요하시면 Savee 고객지원에 문의하세요.</p>`,
      };
    case "resetPassword":
      return {
        subject: "Savee 비밀번호 재설정 인증번호",
        html: `<div class="box" style="${commonStyle}">
      <h1 style="color: #422ef4;">SAVEE</h2>
      <h2 style="text-align: start; color: #333333;">이메일 인증번호</h4>
      <h3 style="text-align: start;">${payload.toEmail} 계정의 비밀번호를 찾는 데 필요한 인증 코드: </h3>
      <h1 style="background-color: #efefef; color: #5cb0ff; padding: 1rem">${payload.code}</h1>
      <hr/>
      <p style="text-align: start;">이 이메일 계정의 비밀번호를 재설정하려면 위 인증 코드(이)가 필요합니다. 비밀번호 찾기를 원하시면 위 인증코드를 인증번호 입력 란에 입력해주시길 바랍니다. 인증코드의 만료 시간은 10분입니다.</p>
    </div>
    <p style="width: 60%; margin: 0 auto; padding: 1rem 0; color: #9a9a9a;">이 이메일은 자동 생성 및 전송되었습니다. 이 이메일에는 답장하지 마세요. 추가적인 도움이 필요하시면 Savee 고객지원에 문의하세요.</p>`,
      };
    case "invite":
      return {
        subject: "Savee 공유 가계부 초대 코드",
        html: `<div class="box" style="${commonStyle}">
      <h1 style="color: #422ef4;">SAVEE</h2>
      <h2 style="text-align: start; color: #333333;">공유 가계부 초대 코드</h4>
      <h3 style="text-align: start;">${payload.ledger} 가계부에 참여하는 데 필요한 인증 코드: </h3>
      <h1 style="background-color: #efefef; color: #5cb0ff; padding: 1rem">${payload.code}</h1>
      <hr/>
      <p style="text-align: start;">초대받은 가계부에 참여하려면 위 인증 코드(이)가 필요합니다. 수락을 원하시면 위 인증코드를 인증번호 입력 란에 입력해주시길 바랍니다. 인증코드의 만료 기간은 7일입니다.</p>
    </div>
    <p style="width: 60%; margin: 0 auto; padding: 1rem 0; color: #9a9a9a;">이 이메일은 자동 생성 및 전송되었습니다. 이 이메일에는 답장하지 마세요. 추가적인 도움이 필요하시면 Savee 고객지원에 문의하세요.</p>`,
      };
  }
}

const sendMail = async ({ toEmail, type, payload }) => {
  const { subject, html } = getMailTemplate(type, payload);
  const transpoter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "wesavee98s@gmail.com",
      pass: process.env.GOOGLE_APP_PASSWORD,
    },
  });
  (async () => {
    try {
      await transpoter.sendMail({
        from: '"Savee Team" <wesavee98s@gmail.com>',
        to: toEmail,
        subject,
        html,
      });
    } catch (error) {
      console.log("이메일 전송 중 오류가 발생했습니다.: ", error);
    }
  })();
};

module.exports = { generateCode, generateInviteCode, generateTempPw, sendMail };
