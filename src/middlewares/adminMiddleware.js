const adminOnly = (req, res, next) => {
  console.log(req.user);
  if (req.user.role != "admin") {
    return res.status(403).json({ message: "관리자만 접근 가능합니다." });
  }
  next();
};

module.exports = {
  adminOnly,
};
