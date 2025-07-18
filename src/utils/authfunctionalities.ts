import * as bcrypt from "bcrypt";
import { sendEmail } from "./sendEmail";
import _ from "lodash";
import jwt from "jsonwebtoken";
import Comment from "../models/Comment";
import { validationResult } from "express-validator";
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import messages from "./constants/messages";

export const hashPassword = async (plainPassword: string) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plainPassword, salt);
  return hash;
};

export const isMatchPassword = async (
  enteredPassword: string,
  userPassword: string
) => {
  const isMatch = await bcrypt.compare(enteredPassword, userPassword);
  if (!isMatch) {
    return false;
  }
  return true;
};

export const generateVerificationCode = (digits = 6): string => {
  return Math.floor(
    Math.pow(10, digits - 1) + Math.random() * 9 * Math.pow(10, digits - 1)
  ).toString();
};

export const sendVerificationCode = async (
  to: string,
  code?: string
): Promise<string | null> => {
  const verificationCode = code || generateVerificationCode();

  const subject = "کد تایید حساب کاربری شما";
  const text = `کد تایید شما: ${verificationCode}`;

  const html = `
    <div style="font-family: Tahoma, Arial, sans-serif; max-width: 440px; margin: 0 auto; background: #fcfcfc; border-radius: 10px; border: 1.2px solid #e0e0e0; box-shadow:0 2px 7px rgba(120,120,120,0.04)">
      <div style="padding:28px 28px 18px 28px">
        <h2 style="color:#2b58a0;margin-bottom:10px;font-size:22px;">کد تایید حساب شما</h2>
        <p style="font-size:1.06em;color:#444;margin-bottom:28px">سلام!<br/>جهت ورود/ثبت‌نام، کد زیر را در سایت وارد کنید:</p>
        <div style="padding:18px 0;border-radius:8px;background:linear-gradient(90deg,#f0f4ff 0%,#fafcff 100%);font-size:2em;font-weight:700;text-align:center;letter-spacing:0.23em;margin-bottom:26px;color:#272d3d;border:1px solid #e6ebfa;">
          ${verificationCode}
        </div>
        <p style="color:#787878;margin-bottom:0;">این کد تا <b>۵ دقیقه</b> اعتبار دارد.<br />اگر این درخواست توسط شما ثبت نشده است، این ایمیل را نادیده بگیرید.</p>
      </div>
      <div style="border-top:1px solid #eee;padding:10px 28px 18px 28px;">
        <p style="font-size:0.92em;color:#b7b7b7;margin:0;text-align:center">با احترام، تیم پشتیبانی وبسایت مانی بلاگ</p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to,
      subject,
      text,
      html,
    });
    return verificationCode;
  } catch (err) {
    console.error("Failed to send verification email:", err);
    return null;
  }
};

export const generateToken = (user: any) => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "30d",
  });

  return token;
};

export async function deleteCommentAndChildren(commentId: any) {
  const children = await Comment.find({ parent: commentId });
  for (const child of children) {
    await deleteCommentAndChildren(child._id); // بازگشتی
  }
  await Comment.findByIdAndDelete(commentId);
}

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const objectIdPatternCheck = (objectId: any) =>
  objectIdPattern.test(objectId);

type TValidationProps = {
  req: Request | AuthRequest;
  res: Response;
};

export const useValidationResult = ({ req, res }: TValidationProps) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return true;
  }
  return false;
};

export function handleError(
  res: any,
  error: any,
  statusCode: number = 500,
  message: string = "خطای سرور"
) {
  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }
  return res.status(statusCode).json({ success: false, message });
}

export function handleSuccess(
  res: any,
  data: any = null,
  message: string = "عملیات با موفقیت انجام شد.",
  statusCode: number = 200
) {
  return res
    .status(statusCode)
    .json({ success: true, message, ...(data !== null ? { data } : {}) });
}
