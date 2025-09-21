const models = require("../models");
const commentService = require("../services/commentService");

// 댓글 추가
const addComments = async (req, res) => {
  const userId = req.user.id;
  const ledgerId = req.params.ledgerId;
  const { content, comment_date } = req.body;

  try {
    const result = await commentService.addComments(
      userId,
      ledgerId,
      content,
      comment_date
    );
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "댓글을 추가하지 못했습니다.";
    res.status(status).json({ message });
  }
};

// 댓글 수정
const updateComment = async (req, res) => {
  const userId = req.user.id;
  const { ledgerId, commentId } = req.params;
  const content = req.body;

  try {
    const result = await commentService.updateComment(
      userId,
      ledgerId,
      commentId,
      content
    );
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "댓글을 수정하지 못했습니다.";
    res.status(status).json({ message });
  }
};

// 댓글 목록 조회 : 쿼리로 특정 날짜를 검색할 수 있지만 사용하지 않으면 댓글이 있는 전체 목록
const getComments = async (req, res) => {
  const userId = req.user.id;
  const { ledgerId, commentId } = req.params;
  const { date } = req.query;

  try {
    const result = await commentService.getComments(
      userId,
      ledgerId,
      commentId,
      date
    );
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    console.log(error);
    const status = error.status || 500;
    const message = error.message || "댓글 목록을 가져오지 못했습니다.";
    res.status(status).json({ message });
  }
};

// 댓글 상세 조회
const findComment = async (req, res) => {
  const userId = req.user.id;
  const { ledgerId, commentId } = req.params;

  try {
    const result = await commentService.findComment(
      userId,
      ledgerId,
      commentId
    );
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "댓글을 가져오지 못했습니다.";
    res.status(status).json({ message });
  }
};

// 댓글 삭제
const deleteComment = async (req, res) => {
  const userId = req.user.id;
  const { ledgerId, commentId } = req.params;

  try {
    const result = await commentService.deleteComment(
      userId,
      ledgerId,
      commentId
    );
    res
      .status(result.status)
      .json({ message: result.message, data: result.data });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "댓글을 삭제하지 못했습니다.";
    res.status(status).json({ message });
  }
};

module.exports = {
  addComments,
  updateComment,
  getComments,
  findComment,
  deleteComment,
};
