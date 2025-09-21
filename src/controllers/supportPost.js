const models = require("../models");
const { Op } = require("sequelize");

//게시글 추가(only admin)
const createPost = async (req, res) => {
  const { title, content, post_type } = req.body;
  const supportPost = await models.SupoportPost.create({
    title,
    content,
    post_type,
    authorId: req.user.id,
  });
  res
    .status(201)
    .json({ message: "게시글이 등록되었습니다.", data: supportPost });
};

//게시글 전체 조회
const findAllPost = async (req, res) => {
  const posts = await models.SupoportPost.findAll();
  res
    .status(200)
    .json({ message: "전체 게시글 목록을 조회 합니다.", data: products });
};

//게시글 수정(only admin)
const updatePost = async (req, res) => {
  const { title, content, post_type } = req.body;
  const id = req.params.id;
  const post = await models.SupoportPost.findByPk(id);
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

//게시글 제목 조회
const findPostByName = async (req, res) => {
  const keyword = req.params.keyword;
  const posts = await models.SupoportPost.findAll({
    where: {
      title: {
        [Op.like]: `%${keyword}%`,
      },
    },
  });
  if (posts) {
    res.status(200).json({ message: "게시글 검색 결과 입니다.", data: posts });
  } else {
    res.status(500).json({ message: "게시글이 없습니다.", error });
  }
};

//게시글 삭제(only admin)
const deletePost = async (req, res) => {
  const id = req.params.id;
  const result = await models.post.destroy({ where: { id: id } });
  if (result) {
    res.status(200).json({ message: "게시글이 삭제되었습니다." });
  } else {
    res.status(404).json({ message: "게시글이 없습니다." });
  }
};
module.exports = {
  createPost,
  findAllPost,
  updatePost,
  deletePost,
};
