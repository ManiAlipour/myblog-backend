import { Request, Response } from "express";
import User from "../models/User";
import {
  filterUser,
  generateToken,
  hashPassword,
  isMatchPassword,
  sendVerificationCode,
} from "../utils/authfunctionalities";

export async function addNewUser(req: Request, res: Response) {
  const { email, password, username } = req.body;

  try {
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      let message = "";
      if (existingUser.email === email.toLowerCase())
        message = "ایمیل قبلاً ثبت شده است.";
      else message = "نام کاربری قبلاً استفاده شده است.";
      return res.status(409).json({ success: false, error: message });
    }

    const hashedPassword = await hashPassword(password);
    const verificationCode = await sendVerificationCode(email);

    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      username,
      verificationCode,
    });

    user.verificationCodeExpires = new Date(Date.now() + 5 * 60 * 1000);
    const savedUser = await user.save();

    const filteredUser = filterUser(user.toObject());

    res.json({
      success: true,
      message: "کد تایید با موفقیت ارسال شد!",
      user: filteredUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "خطای ارتباط با سرور." });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  const { code, email } = req.body;

  try {
    const user = await User.findOne({ email: email?.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({ message: "کاربر پیدا نشد!" });
    }

    if (!user.verificationCode || !user.verificationCodeExpires) {
      return res
        .status(400)
        .json({ message: "کد ورودی برای کاربر ست نشده است" });
    }

    if (
      user.verificationCode !== code ||
      user.verificationCodeExpires < new Date()
    ) {
      return res
        .status(400)
        .json({ message: "کد نامعتبر است یا منقضی شده است!" });
    }

    user.isEmailVerified = true;
    user.verificationCode = "";
    user.verificationCodeExpires = null;
    await user.save();

    const token = generateToken(user);

    return res.status(200).json({
      message: "اعتبارسنجی ایمیل با موفقیت انجام شد.",
      user: filterUser(user.toObject()),
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "خطای ارتباط با سرور." });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, error: "کاربری با ایمیل مدنظر پیدا نشد!" });
    }

    const isMatchPass = isMatchPassword(password, user.password);

    if (!isMatchPass) {
      return res
        .status(500)
        .json({ success: false, error: "رمز عبور اشتباه است!" });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "ورود کاربر با موفقیت انجام شد.",
      user: filterUser(user.toObject()),
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "خطای ارتباط با سرور." });
  }
}

