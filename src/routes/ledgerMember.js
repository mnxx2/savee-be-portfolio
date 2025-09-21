const express = require("express");
const router = express.Router({ mergeParams: true });
const ledgerMemberController = require("../controllers/ledgerMemberController");
const inviteController = require("../controllers/inviteController");
const { authenticate } = require("../middlewares/authMiddleware");

router.post("/", authenticate, inviteController.createInvites);
router.get("/", authenticate, ledgerMemberController.getMembers);
router.get("/:memberId", authenticate, ledgerMemberController.findMember);
router.delete("/:memberId", authenticate, ledgerMemberController.deleteMember);

module.exports = router;
