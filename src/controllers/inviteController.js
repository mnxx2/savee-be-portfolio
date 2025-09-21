const models = require("../models");
const inviteService = require("../services/inviteService");

const createInvites = async (req, res) => {
  const { email } = req.body;
  const ledgerId = parseInt(req.params.ledgerId, 10);
  const ownerId = req.user.id;

  try {
    const result = await inviteService.createInviteAndSend(
      email,
      ledgerId,
      ownerId
    );
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "초대 코드 메일을 발송하지 못했습니다.";
    res.status(status).json(message);
  }
};

const acceptInvite = async (req, res) => {
  const { code, ledgerId } = req.params;
  const memberId = req.user.id;
  const email = req.user.email;

  try {
    const result = await inviteService.acceptInvite(code, email, memberId);
    res.status(result.status).json({ message: result.message });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "초대 코드 메일을 발송하지 못했습니다.";
    res.status(status).json(message);
  }
};

module.exports = {
  createInvites,
  acceptInvite,
};
