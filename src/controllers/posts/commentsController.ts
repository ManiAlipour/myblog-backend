import { Request, Response } from "express";
import Comment from "../../models/Comment";
import Post from "../../models/Post";
import {
  deleteCommentAndChildren,
  objectIdPatternCheck,
  useValidationResult,
  handleError,
  handleSuccess,
} from "../../utils/authfunctionalities";
import { filterComment } from "../../utils/filterMethods";
import messages, { STATUS_CODES } from "../../utils/constants/messages";
import { AuthRequest } from "../../middleware/authMiddleware";

export async function getPostComments(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!id || !objectIdPattern.test(id)) {
      return handleError(
        res,
        null,
        STATUS_CODES.BAD_REQUEST,
        messages.INVALID_POST_ID
      );
    }

    const comments = await Comment.find({ post: id, isApproved: true })
      .populate("author", "username name avatar")
      .sort({ createdAt: -1 });
    handleSuccess(
      res,
      comments.map((comment: any) => filterComment(comment)),
      messages.COMMENTS_LIST_RECEIVED,
      STATUS_CODES.OK
    );
  } catch (error) {
    handleError(
      res,
      error,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      messages.SERVER_CONNECTION_ERROR
    );
  }
}

export async function addCommentToPost(req: AuthRequest, res: Response) {
  if (useValidationResult({ req, res })) return;

  const { id } = req.params;
  const { content, parent = null } = req.body;

  try {
    const post = await Post.findById(id);

    if (!post)
      return handleError(
        res,
        null,
        STATUS_CODES.NOT_FOUND,
        messages.POST_NOT_FOUND
      );

    if (parent) {
      const parentComment = await Comment.findById(parent);
      if (!parentComment || parentComment.post.toString() !== id) {
        return handleError(
          res,
          null,
          STATUS_CODES.BAD_REQUEST,
          messages.PARENT_COMMENT_NOT_FOUND_OR_NOT_RELATED
        );
      }
    }

    const comment = new Comment({
      post: id,
      author: req.user._id,
      content,
      ...(parent ? { parent } : {}),
    });

    const savedComment = await comment.save();

    await savedComment.populate("author", "username name");

    handleSuccess(
      res,
      filterComment(savedComment),
      messages.COMMENT_ADDED_SUCCESSFULLY,
      STATUS_CODES.CREATED
    );
  } catch (error) {
    handleError(
      res,
      error,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      messages.SERVER_CONNECTION_ERROR
    );
  }
}

export async function deleteComment(req: AuthRequest, res: Response) {
  const { id } = req.params;

  try {
    if (!objectIdPatternCheck(id))
      return handleError(
        res,
        null,
        STATUS_CODES.BAD_REQUEST,
        messages.INVALID_COMMENT_ID
      );

    const comment = await Comment.findById(id);

    if (!comment)
      return handleError(
        res,
        null,
        STATUS_CODES.NOT_FOUND,
        messages.COMMENT_NOT_FOUND
      );

    if (
      req.user._id === comment.author.toString() ||
      req.user.role === "admin"
    ) {
      const deletedComment = await Comment.findByIdAndDelete(id);

      await deleteCommentAndChildren(comment._id);

      handleSuccess(
        res,
        filterComment(deletedComment),
        messages.COMMENT_DELETED_SUCCESSFULLY,
        STATUS_CODES.OK
      );
      return;
    }

    return handleError(
      res,
      null,
      STATUS_CODES.FORBIDDEN,
      messages.NO_PERMISSION_TO_DELETE_COMMENT
    );
  } catch (error) {
    handleError(
      res,
      error,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      messages.SERVER_CONNECTION_ERROR
    );
  }
}

export async function setConfirmComment(req: Request, res: Response) {
  const { id } = req.params;

  const { status } = req.body;

  try {
    if (typeof status !== "boolean")
      return handleError(
        res,
        null,
        STATUS_CODES.BAD_REQUEST,
        messages.INVALID_STATUS_VALUE
      );

    if (!objectIdPatternCheck(id))
      return handleError(
        res,
        null,
        STATUS_CODES.BAD_REQUEST,
        messages.INVALID_COMMENT_ID
      );

    const comment = await Comment.findById(id);

    if (!comment)
      return handleError(
        res,
        null,
        STATUS_CODES.NOT_FOUND,
        messages.COMMENT_NOT_FOUND
      );

    comment.isApproved = status;
    const savedComment = await comment.save();

    handleSuccess(
      res,
      filterComment(savedComment),
      messages.COMMENT_STATUS_CHANGED,
      STATUS_CODES.OK
    );
    return;
  } catch (error) {
    handleError(
      res,
      error,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      messages.SERVER_CONNECTION_ERROR
    );
  }
}
