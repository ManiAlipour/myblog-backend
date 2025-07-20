import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import Analytics from "../../models/Analytics";
import { handleError, handleSuccess } from "../../utils/authfunctionalities";
import messages, { STATUS_CODES } from "../../utils/constants/messages";

export async function setPageView(req: Request | AuthRequest, res: Response) {
  try {
    const user = (req as AuthRequest).user?._id;
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

export async function getALLPageViewsCount(req: AuthRequest, res: Response) {
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

export async function getOnePageAnalyticsData(req: AuthRequest, res: Response) {
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
