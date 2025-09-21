const { signupSchema } = require("../utils/validation");

const validateSignup = (req, res, next) => {
  const { error } = signupSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  next();
};

module.exports = { validateSignup };
