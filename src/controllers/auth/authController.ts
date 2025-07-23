import { Request, Response } from "express";
import {
  generateToken,
  handleError,
  handleSuccess,
  hashPassword,
  isMatchPassword,
  sendVerificationCode,
  useValidationResult,
} from "../../utils/authfunctionalities";
import User from "../../models/User";
import { filterUser } from "../../utils/filterMethods";
import messages, { STATUS_CODES } from "../../utils/constants/messages";
import { AuthRequest } from "../../middleware/authMiddleware";

const MSG_EMAIL_USED = "ایمیل قبلاً ثبت شده است.";
const MSG_USERNAME_USED = "نام کاربری قبلاً استفاده شده است.";

export async function addNewUser(req: Request, res: Response) {
  if (useValidationResult({ req, res })) return;

  const { email, password, username } = req.body;

  try {
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      const isEmailUsed = existingUser.email === email.toLowerCase();
      const message = isEmailUsed ? MSG_EMAIL_USED : MSG_USERNAME_USED;
      return handleError(res, null, 409, message);
    }

    const hashedPassword = await hashPassword(password);
    const code = await sendVerificationCode(email);

    if (!code) {
      return handleError(
        res,
        null,
        500,
        "ارسال ایمیل تایید انجام نشد. لطفاً کمی بعد دوباره تلاش کنید."
      );
    }

    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      username,
      code,
    });

    const VERIFICATION_CODE_EXPIRE_MS = 5 * 60 * 1000;
    user.verificationCodeExpires = new Date(
      Date.now() + VERIFICATION_CODE_EXPIRE_MS
    );

    const savedUser = await user.save();

    const filteredUser = filterUser(savedUser);

    handleSuccess(res, filteredUser, messages.SUCCESS, 201);
  } catch (error) {
    handleError(res, error, 500, messages.SERVER_ERROR);
  }
}

export async function verifyEmail(req: Request, res: Response) {
  const { code, email } = req.body;

  try {
    const user = await User.findOne({ email: email?.toLowerCase().trim() });

    if (!user) {
      return handleError(res, null, 404, messages.USER_NOT_FOUND);
    }

    if (!user.verificationCode || !user.verificationCodeExpires) {
      return handleError(res, null, 400, messages.VERIFICATION_CODE_NOT_SET);
    }

    if (
      user.verificationCode !== code ||
      user.verificationCodeExpires < new Date()
    ) {
      return handleError(res, null, 400, messages.INVALID_OR_EXPIRED_CODE);
    }

    user.isEmailVerified = true;
    user.verificationCode = "";
    user.verificationCodeExpires = null;
    await user.save();

    const token = generateToken(user);

    return handleSuccess(
      res,
      { user: filterUser(user), token },
      messages.EMAIL_VERIFICATION_SUCCESS,
      200
    );
  } catch (error) {
    handleError(res, error, 500, messages.SERVER_ERROR);
  }
}

export async function login(req: Request, res: Response) {
  if (useValidationResult({ req, res })) return;

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return handleError(res, null, 400, messages.USER_NOT_FOUND_BY_EMAIL);
    }

    const isMatchPass = isMatchPassword(password, user.password);

    if (!isMatchPass) {
      return handleError(
        res,
        null,
        STATUS_CODES.INTERNAL_SERVER_ERROR,
        messages.INCORRECT_PASSWORD
      );
    }

    user.isActive = true;

    const savedUser = await user.save();

    const token = generateToken(user);

    return handleSuccess(
      res,
      { user: filterUser(savedUser), token },
      messages.LOGIN_SUCCESS,
      200
    );
  } catch (error) {
    handleError(res, error, 500, messages.SERVER_ERROR);
  }
}

export async function logout(req: AuthRequest, res: Response) {
  const { _id } = req.user;

  try {
    const user = await User.findById(_id);

    if (!user || !user.isActive)
      return handleError(
        res,
        null,
        user ? STATUS_CODES.BAD_REQUEST : STATUS_CODES.NOT_FOUND,
        user ? messages.USER_ALREADY_LOGEDOUT : messages.USER_NOT_FOUND
      );
    user.isActive = false;

    const savedUser = await user.save();

    return handleSuccess(
      res,
      filterUser(savedUser),
      messages.SUCCESS,
      STATUS_CODES.OK
    );
  } catch (error) {
    handleError(
      res,
      error,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      messages.SERVER_ERROR
    );
  }
}
