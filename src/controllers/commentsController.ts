import { Request, Response } from "express";
import Comment from "../models/Comment";
import Post from "../models/Post";
import {
  deleteCommentAndChildren,
  objectIdPatternCheck,
  useValidationResult,
} from "../utils/authfunctionalities";
import { AuthRequest } from "../middleware/authMiddleware";
import { filterComment } from "../utils/filterMethods";
import messages from "../utils/constants/messages";

export async function getPostComments(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!id || !objectIdPattern.test(id)) {
      return res
        .status(400)
        .json({ success: false, error: messages.INVALID_POST_ID });
    }

    const comments = await Comment.find({ post: id, isApproved: true })
      .populate("author", "username name avatar")
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      message: messages.COMMENTS_LIST_RECEIVED,
      data: comments.map((comment: any) => filterComment(comment)),
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: messages.SERVER_CONNECTION_ERROR });
  }
}

export async function addCommentToPost(req: AuthRequest, res: Response) {
  if (useValidationResult({ req, res })) return;

  const { id } = req.params;
  const { content, parent = null } = req.body;

  try {
    const post = await Post.findById(id);

    if (!post)
      return res
        .status(404)
        .json({ success: false, message: messages.POST_NOT_FOUND });

    if (parent) {
      const parentComment = await Comment.findById(parent);
      if (!parentComment || parentComment.post.toString() !== id) {
        return res.status(400).json({
          success: false,
          message: messages.PARENT_COMMENT_NOT_FOUND_OR_NOT_RELATED,
        });
      }
    }

    const comment = new Comment({
      post: id,
      author: req.user.id,
      content,
      ...(parent ? { parent } : {}),
    });

    const savedComment = await comment.save();

    await savedComment.populate("author", "username name");

    res.status(201).json({
      success: true,
      message: messages.COMMENT_ADDED_SUCCESSFULLY,
      data: filterComment(savedComment),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: messages.SERVER_CONNECTION_ERROR });
  }
}

export async function deleteComment(req: AuthRequest, res: Response) {
  const { id } = req.params;

  try {
    if (!objectIdPatternCheck(id))
      return res
        .status(400)
        .json({ success: false, message: messages.INVALID_COMMENT_ID });

    const comment = await Comment.findById(id);

    if (!comment)
      return res
        .status(404)
        .json({ success: false, message: messages.COMMENT_NOT_FOUND });

    if (
      req.user.id === comment.author.toString() ||
      req.user.role === "admin"
    ) {
      const deletedComment = await Comment.findByIdAndDelete(id);

      await deleteCommentAndChildren(comment._id);

      return res.json({
        success: true,
        message: messages.COMMENT_DELETED_SUCCESSFULLY,
        data: filterComment(deletedComment),
      });
    }

    return res.status(403).json({
      success: false,
      message: messages.NO_PERMISSION_TO_DELETE_COMMENT,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: messages.SERVER_CONNECTION_ERROR });
  }
}

export async function setConfirmComment(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const { status } = req.body;

  try {
    if (typeof status !== "boolean")
      return res.status(400).json({
        success: false,
        message: messages.INVALID_STATUS_VALUE,
      });

    if (!objectIdPatternCheck(id))
      return res
        .status(400)
        .json({ success: false, message: messages.INVALID_COMMENT_ID });

    const comment = await Comment.findById(id);

    if (!comment)
      return res
        .status(404)
        .json({ success: false, message: messages.COMMENT_NOT_FOUND });

    comment.isApproved = status;
    const savedComment = await comment.save();

    return res.json({
      success: true,
      message: messages.COMMENT_STATUS_CHANGED,
      data: filterComment(savedComment),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: messages.SERVER_CONNECTION_ERROR });
  }
}
