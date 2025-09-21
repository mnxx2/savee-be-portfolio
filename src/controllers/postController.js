const models = require("../models");
const { Op } = require("sequelize");
const paginate = require("../utils/pagination");
//게시글 추가(only admin)
const createPost = async (req, res) => {
  const { title, content, post_type } = req.body;
  const supportPost = await models.SupportPost.create({
    title,
    content,
    post_type,
    userId: req.user.id,
  });
  res
    .status(201)
    .json({ message: "게시글이 등록되었습니다.", data: supportPost });
};

//게시글 조회
const findAllPost = async (req, res) => {
  try {
    const { items: data, pagination } = await paginate(
      models.SupportPost,
      req.query
    );
    res.status(200).json({
      message: "전체 게시글 목록을 조회 합니다.",
      data: { data, pagination },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};
//게시글 id로 조회
const findPostById = async (req, res) => {
  const id = req.params.id;
  const post = await models.SupportPost.findByPk(id);
  if (post) {
    res.status(200).json({
      message: "게시글을 불러왔습니다.",
      data: post,
    });
  } else {
    res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  }
};

//게시글 수정(only admin)
const updatePost = async (req, res) => {
  const { title, content, post_type } = req.body;
  const id = req.params.id;
  const post = await models.SupportPost.findByPk(id);
  if (post) {
    if (title) post.title = title;
    if (content) post.content = content;
    if (post_type) post.post_type = post_type;
    await post.save();
    res
      .status(200)
      .json({ message: "게시글 수정이 완료되었습니다.", data: post });
  } else {
    res.status(404).json({ message: "게시글이 없습니다." });
  }
};

//게시글 삭제(only admin)
const deletePost = async (req, res) => {
  const id = req.params.id;
  const result = await models.SupportPost.destroy({ where: { id: id } });
  if (result) {
    res.status(200).json({ message: "게시글이 삭제되었습니다." });
  } else {
    res.status(404).json({ message: "게시글이 없습니다." });
  }
};
module.exports = {
  createPost,
  findAllPost,
  findPostById,
  updatePost,
  deletePost,
};
