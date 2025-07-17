import { Request, Response } from "express";
import User from "../models/User";
import {
  generateToken,
  hashPassword,
  isMatchPassword,
  sendVerificationCode,
  useValidationResult,
} from "../utils/authfunctionalities";
import { filterUser } from "../utils/filterMethods";
import { AuthRequest } from "../middleware/authMiddleware";

export async function addNewUser(req: Request, res: Response) {
  if (useValidationResult({ req, res })) return;

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
      return res.status(409).json({ success: false, message });
    }

    const hashedPassword = await hashPassword(password);
    const code = await sendVerificationCode(email);

    if (!code) {
      return res.status(500).json({
        success: false,
        message: "ارسال ایمیل تایید انجام نشد. لطفاً کمی بعد دوباره تلاش کنید.",
      });
    }

    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      username,
      code,
    });

    user.verificationCodeExpires = new Date(Date.now() + 5 * 60 * 1000);
    const savedUser = await user.save();

    const filteredUser = filterUser(savedUser);

    res.json({
      success: true,
      message: "کد تایید با موفقیت ارسال شد!",
      user: filteredUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "خطای ارتباط با سرور." });
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
      user: filterUser(user),
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "خطای ارتباط با سرور." });
  }
}

export async function login(req: Request, res: Response) {
  if (useValidationResult({ req, res })) return;

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
      user: filterUser(user),
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "خطای ارتباط با سرور." });
  }
}

export async function getProfile(req: AuthRequest, res: Response) {
  const user = req.user;

  try {
    const filteredUser = filterUser(user);

    res.json({
      success: true,
      message: "پروفایل با موفقیت دریافت شد.",
      data: filteredUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "خطای ارتباط با سرور." });
  }
}

export async function editProfile(req: AuthRequest, res: Response) {
  if (useValidationResult({ req, res })) return;

  const { username, name, bio, avatar } = req.body;

  try {
    if (username && username !== req.user.username) {
      const userWithSameUsername = await User.findOne({ username });
      if (
        userWithSameUsername &&
        userWithSameUsername._id.toString() !== req.user._id.toString()
      ) {
        return res.status(409).json({
          success: false,
          message: "این نام کاربری قبلاً توسط کاربر دیگری ثبت شده است.",
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(username !== undefined && { username }),
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: "کاربر پیدا نشد!" });
    }

    const filteredUser = filterUser(updatedUser);

    res.json({
      success: true,
      message: "پروفایل با موفقیت ویرایش شد.",
      data: filteredUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "خطای ارتباط با سرور." });
  }
}

export async function getAllUsers(req: AuthRequest, res: Response) {
  try {
    const { search, id, sort, role, status } = req.query;
    // Search by ID (exact) with ObjectId validation
    if (id) {
      const objectIdPattern = /^[0-9a-fA-F]{24}$/;
      if (typeof id !== "string" || !objectIdPattern.test(id)) {
        return res
          .status(400)
          .json({ success: false, error: "شناسه کاربر نامعتبر است." });
      }
      const user = await User.findById(id as string);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, error: "کاربر پیدا نشد!" });
      }
      return res.json({
        success: true,
        message: "کاربر با موفقیت پیدا شد.",
        data: [filterUser(user.toObject())],
        pagination: { total: 1, page: 1, limit: 1, totalPages: 1 },
      });
    }

    // Search by text (username, name, email)
    let query: any = {};
    if (search) {
      const regex = new RegExp(search as string, "i");
      query.$or = [{ username: regex }, { name: regex }, { email: regex }];
    }
    // Filter by role
    if (role) {
      query.role = role;
    }
    // Filter by status (isActive)
    if (status !== undefined) {
      if (status === "active") query.isActive = true;
      else if (status === "inactive") query.isActive = false;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    let sortOption: any = { createdAt: -1 }; // Default: newest
    if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "username") sortOption = { username: 1 };
    else if (sort === "email") sortOption = { email: 1 };
    else if (sort === "name") sortOption = { name: 1 };
    else if (sort === "role") sortOption = { role: 1 };

    const [users, total] = await Promise.all([
      User.find(query).sort(sortOption).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    const filteredUsers = users.map((user) => filterUser(user));
    res.json({
      success: true,
      message: "لیست کاربران با موفقیت دریافت شد.",
      data: filteredUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "خطای ارتباط با سرور." });
  }
}
