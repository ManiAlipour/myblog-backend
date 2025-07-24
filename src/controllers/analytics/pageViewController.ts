import { Request, Response } from "express";
import Analytics from "../../models/Analytics";
import {
  handleError,
  handleSuccess,
  objectIdPatternCheck,
} from "../../utils/funcs/authfunctionalities";
import messages, { STATUS_CODES } from "../../utils/constants/messages";
import Post from "../../models/Post";
import Comment from "../../models/Comment";
import { AuthRequest } from "../../middleware/authMiddleware";

export async function setPageView(req: AuthRequest, res: Response) {
  try {
    let user = req?.user;

    const ipRaw =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip;
    const ip = Array.isArray(ipRaw)
      ? ipRaw[0]
      : ipRaw?.toString().split(",")[0].trim();
    const url = req.body?.url || req.originalUrl || req.url;
    const userAgent = req.headers["user-agent"] || "unknown";
    const referrer =
      req.body?.referrer ||
      req.headers["referer"] ||
      req.headers["referrer"] ||
      "";

    await Analytics.create({
      user: user || undefined,
      ip,
      url,
      userAgent,
      referrer,
    });

    return handleSuccess(res, null, messages.SUCCESS, STATUS_CODES.CREATED);
  } catch (error) {
    return handleError(
      res,
      error,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      messages.SERVER_CONNECTION_ERROR
    );
  }
}

export async function getALLPageViewsCount(req: Request, res: Response) {
  try {
    const totalPageViews = await Analytics.countDocuments();
    return handleSuccess(
      res,
      { totalPageViews },
      messages.SUCCESS,
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

export async function getOnePageAnalyticsData(req: Request, res: Response) {
  try {
    const url = req.query.url || req.body?.url;
    if (!url) {
      return handleError(
        res,
        null,
        STATUS_CODES.BAD_REQUEST,
        "آدرس صفحه ارسال نشده است."
      );
    }
    const totalViews = await Analytics.countDocuments({ url });
    const pageViews = await Analytics.find({ url })
      .sort({ createdAt: -1 })
      .limit(20);
    return handleSuccess(
      res,
      { url, totalViews, pageViews },
      messages.SUCCESS,
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

export async function getPostAnalyticsData(req: Request, res: Response) {
  try {
    const { postId } = req.params;

    if (!postId || !objectIdPatternCheck(postId))
      return handleError(
        res,
        null,
        STATUS_CODES.BAD_REQUEST,
        messages.INVALID_POST_ID
      );

    const { views: totalViews, likes } = await Post.findById(postId);
    const commentsCount = (await Comment.countDocuments({ post: postId })) || 0;

    const data = { totalViews, likeCount: likes, commentsCount };

    return handleSuccess(res, data, messages.SUCCESS);
  } catch (error) {
    return handleError(
      res,
      error,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      messages.SERVER_CONNECTION_ERROR
    );
  }
}
