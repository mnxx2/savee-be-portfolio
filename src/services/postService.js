const { SupportPost } = require("../models");

//게시글 추가(only admin)
const createPost = async (req, res) => {
  const { title, content, post_type } = req.body;
  const supportPost = await models.SupportPost.create({
    title,
    content,
    post_type,
    authorId: req.user.id,
  });
  res
    .status(201)
    .json({ message: "게시글이 등록되었습니다.", data: supportPost });
};
