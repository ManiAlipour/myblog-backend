import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import {
  handleError,
  handleSuccess,
  objectIdPatternCheck,
  useValidationResult,
} from "../../utils/authfunctionalities";
import messages, { STATUS_CODES } from "../../utils/constants/messages";
import Post from "../../models/Post";
import User from "../../models/User";
import Like from "../../models/Like";
import { filterLike } from "../../utils/filterMethods";

export async function setLikeOrUnlikePost(req: AuthRequest, res: Response) {
  if (useValidationResult({ req, res })) return;

  const { postId } = req.body;
  const { id: userId } = req.user;

  try {
    if (!objectIdPatternCheck(postId))
      return handleError(
        res,
        null,
        STATUS_CODES.BAD_REQUEST,
        messages.INVALID_POST_ID
      );

    const post = await Post.findById(postId);
    if (!post)
      return handleError(
        res,
        null,
        STATUS_CODES.NOT_FOUND,
        messages.POST_NOT_FOUND
      );

    const like = await Like.findOne({ postId, userId });
    let responseObj;
    let message;
    let statusCode;
    if (like) {
      const deletedLike = await Like.findOneAndDelete({ postId, userId });
      const likeCount = await Like.countDocuments({ postId });
      responseObj = {
        ...filterLike(deletedLike),
        likeCount,
        liked: false,
      };
      message = messages.LIKE_DELETED;
      statusCode = STATUS_CODES.OK;
    } else {
      const createdLike = new Like({
        postId,
        userId,
      });
      const savedLike = await createdLike.save();
      const likeCount = await Like.countDocuments({ postId });
      responseObj = {
        ...filterLike(savedLike),
        likeCount,
        liked: true,
      };
      message = messages.LIKE_ADDED;
      statusCode = STATUS_CODES.CREATED;
    }
    return handleSuccess(res, responseObj, message, statusCode);
  } catch (error) {
    return handleError(
      res,
      error,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      messages.SERVER_CONNECTION_ERROR
    );
  }
}

export async function getPostLikeCount(req: Request, res: Response) {
  const { postId } = req.params;
  if (!postId || !objectIdPatternCheck(postId)) {
    return handleError(
      res,
      null,
      STATUS_CODES.BAD_REQUEST,
      messages.INVALID_POST_ID
    );
  }
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return handleError(
        res,
        null,
        STATUS_CODES.NOT_FOUND,
        messages.POST_NOT_FOUND
      );
    }
    const likeCount = await Like.countDocuments({ postId });
    return handleSuccess(
      res,
      { likeCount },
      messages.LIKE_COUNT_RETRIEVED,
      STATUS_CODES.OK
    );
  } catch (error) {
    return handleError(
      res,
      error,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      messages.SERVER_CONNECTION_ERROR
    );
  }
}

export async function getUserLikes(req: AuthRequest, res: Response) {
  const { id } = req.user;
  let { page = 1, limit = 5 } = req.query;

  page = Math.max(+page, 1);
  limit = Math.max(+limit, 1);
  try {
    const likes = await Like.find({ userId: id })
      .skip((page - 1) * limit)
      .limit(limit);

    const filteredLikes = likes.map((like) => filterLike(like));
    if (!likes.length) {
      return handleSuccess(res, [], messages.NO_LIKES, STATUS_CODES.OK);
    }

    const totalLikes = await Like.countDocuments({ userId: id });

    return handleSuccess(
      res,
      {
        likes: filteredLikes,
        currentPage: Number(page),
        totalPages: Math.ceil(totalLikes / +limit),
      },
      messages.LIKE_COUNT_RETRIEVED,
      STATUS_CODES.OK
    );
  } catch (error) {
    return handleError(
      res,
      error,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      messages.SERVER_CONNECTION_ERROR
    );
  }
}

