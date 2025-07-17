import * as bcrypt from "bcrypt";
import { sendEmail } from "./sendEmail";
import _ from "lodash";
import jwt from "jsonwebtoken";
import { allowedPostFields, SENSITIVE_USER_FIELDS } from "./constants/fields";
import { IPost } from "../models/Post";
import { allowedCommentFields } from "./constants/fields";
import Comment from "../models/Comment";

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
): Promise<string> => {
  const verificationCode = code || generateVerificationCode();

  const subject = "کد تأیید شما";
  const text = `کد تایید شما: ${verificationCode}`;
  const html = `
    <div style="font-family:tahoma,Verdana">
      <h2>کد تایید ورود یا ثبت نام</h2>
      <p>کد شما: <strong style="font-size: 1.5em">${verificationCode}</strong></p>
      <p>این کد تا ۵ دقیقه معتبر است.</p>
    </div>
  `;

  await sendEmail({
    to,
    subject,
    text,
    html,
  });

  return verificationCode;
};

export const filterUser = (user: any) => {
  let filteredUser = _.omit(user, SENSITIVE_USER_FIELDS) as Record<string, any>;
  filteredUser.id = filteredUser._id;
  delete filteredUser._id;

  return filteredUser;
};

export function filterPost(post: IPost) {
  const obj = typeof post.toObject === "function" ? post.toObject() : post;
  const picked = _.pick(obj, allowedPostFields);
  picked.id = picked._id?.toString();
  delete picked._id;
  return picked;
}

export function filterComment(comment: any) {
  const obj =
    typeof comment.toObject === "function" ? comment.toObject() : comment;
  const picked = _.pick(obj, allowedCommentFields);
  picked.id = picked._id?.toString();
  delete picked._id;
  return picked;
}

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
