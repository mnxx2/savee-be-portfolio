const adminService = require("../services/adminService");

const createUser = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const result = await adminService.createUser(email, name, password, role);
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "사용자 생성 중 오류가 발생했습니다.";
    res.status(status).json({ error: message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await adminService.getAllUsers();
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "회원 목록 조회 중 오류가 발생했습니다.";
    res.status(status).json({ error: message });
  }
};

const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, password, role } = req.body;
    const result = await adminService.updateUser(
      id,
      name,
      email,
      password,
      role
    );
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "회원 정보 수정 중 오류가 발생했습니다.";
    res.status(status).json({ error: message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await adminService.deleteUser(id);
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "회원 삭제 중 오류가 발생했습니다.";
    res.status(status).json({ error: message });
  }
};

module.exports = { createUser, getAllUsers, updateUser, deleteUser };
