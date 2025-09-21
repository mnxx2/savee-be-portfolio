const models = require("../models");
const bcrypt = require("bcrypt");

const createUser = async (email, name, password, role) => {
  const hashedPw = await bcrypt.hash(password, 10);
  const user = await models.User.create({
    email,
    name,
    password: hashedPw,
    role,
  });
  return {
    message: "회원 등록이 완료되었습니다.",
    userEmail: user.email,
    role: user.role,
  };
};

const getAllUsers = async () => {
  const users = await models.User.findAll({
    attributes: ["id", "email", "name", "role", "createdAt"],
    order: [["createdAt", "DESC"]],
  });
  return { users };
};

const updateUser = async (id, name, email, password, role) => {
  const user = await models.User.findByPk(id);
  if (!user) {
    const error = new Error("회원을 조회할 수 없습니다.");
    error.status = 404;
    throw error;
  }
  if (name) {
    user.name = name;
  }
  if (email) {
    user.email = email;
  }
  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }
  if (role) {
    user.role = role;
  }
  await user.save();
  return { message: "회원 정보가 정상적으로 변경되었습니다." };
};

const deleteUser = async (id) => {
  const user = await models.User.findByPk(id);
  if (!user) {
    const error = new Error("사용자를 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }
  await user.destroy();
  return { message: `회원(${user.name})을 성공적으로 삭제했습니다.` };
};

module.exports = { createUser, getAllUsers, updateUser, deleteUser };
