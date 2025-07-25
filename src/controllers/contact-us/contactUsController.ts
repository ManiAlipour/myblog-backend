import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import {
  handleError,
  handleSuccess,
  objectIdPatternCheck,
  useValidationResult,
} from "../../utils/funcs/authfunctionalities";
import sanitize from "../../utils/services/sanitize";
import Message from "../../models/Message";
import { filterMessage } from "../../utils/funcs/filterMethods";
import messages, { STATUS_CODES } from "../../utils/constants/messages";

export async function sendMessage(req: AuthRequest, res: Response) {
  if (useValidationResult({ req, res })) return;

  const { _id: userId } = req.user;
  let { title, content } = req.body;

  try {
    title = sanitize(title);
    content = sanitize(content);

    const message = new Message({
      title,
      content,
      userId,
    });

    const savedMessage = await message.save();

    return handleSuccess(
      res,
      { msg: filterMessage(savedMessage) },
      messages.MESSAGE_ADDED
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

export async function allowMessage(req: AuthRequest, res: Response) {
  let { permission, messageId } = req.body;

  if (typeof permission !== "boolean") {
    if (permission === "true") permission = true;
    else if (permission === "false") permission = false;
    else
      return handleError(
        res,
        null,
        STATUS_CODES.BAD_REQUEST,
        messages.PERMISSION_NOT_VALID
      );
  }

  if (!messageId || !objectIdPatternCheck(messageId))
    return handleError(
      res,
      null,
      STATUS_CODES.BAD_REQUEST,
      messages.INVALID_MESSAGE_ID
    );

  try {
    const message = await Message.findById(messageId);
    if (!message)
      return handleError(
        res,
        null,
        STATUS_CODES.NOT_FOUND,
        messages.MESSAGE_NOT_FOUND
      );

    if (message.permission === permission)
      return handleSuccess(res, {
        msg: filterMessage(message),
        info: "مقدار مجوز تغییر نکرد.",
      });

    message.permission = permission;
    const savedMessage = await message.save();

    return handleSuccess(res, { msg: filterMessage(savedMessage) });
  } catch (error) {
    return handleError(
      res,
      error,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      messages.SERVER_CONNECTION_ERROR
    );
  }
}

export async function setShowInSatisfactions(req: AuthRequest, res: Response) {
  let { show, messageId } = req.body;

  if (typeof show !== "boolean") {
    if (show === "true") show = true;
    else if (show === "false") show = false;
    else
      return handleError(
        res,
        null,
        STATUS_CODES.BAD_REQUEST,
        messages.SHOW_NOT_VALID
      );
  }

  if (!messageId || !objectIdPatternCheck(messageId))
    return handleError(
      res,
      null,
      STATUS_CODES.BAD_REQUEST,
      messages.INVALID_MESSAGE_ID
    );

  try {
    const message = await Message.findById(messageId);
    if (!message)
      return handleError(
        res,
        null,
        STATUS_CODES.NOT_FOUND,
        messages.MESSAGE_NOT_FOUND
      );

    if (message.showInSatisfactions === show)
      return handleSuccess(res, {
        msg: filterMessage(message),
        info: "نمایش رضایت بدون تغییر.",
      });

    message.showInSatisfactions = show;
    const savedMessage = await message.save();

    return handleSuccess(res, { msg: filterMessage(savedMessage) });
  } catch (error) {
    return handleError(
      res,
      error,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      messages.SERVER_CONNECTION_ERROR
    );
  }
}

export async function getMessages(req: Request, res: Response) {
  let { limit = 5, page = 1 } = req.query;

  limit = Number.isFinite(+limit) && +limit > 0 ? +limit : 5;
  page = Number.isFinite(+page) && +page > 0 ? +page : 1;

  try {
    const [messagesList, total] = await Promise.all([
      Message.find({
        published: true,
        showInSatisfactions: true,
      })
        .limit(limit)
        .skip((page - 1) * limit)
        .populate("userId", "name")
        .sort({ createdAt: -1 }),
      Message.countDocuments({
        published: true,
        showInSatisfactions: true,
      }),
    ]);

    const filtredMessages = messagesList.map((msg) => filterMessage(msg));

    return handleSuccess(
      res,
      {
        messages: filtredMessages,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      messages.SUCCESS
    );
  } catch (error) {
    console.error(error);
    return handleError(
      res,
      error,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      messages.SERVER_CONNECTION_ERROR
    );
  }
}
