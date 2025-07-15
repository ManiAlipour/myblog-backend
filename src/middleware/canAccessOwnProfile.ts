import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";

export const canAccessOwnProfile = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user) {
    // هر کاربر لاگین‌شده می‌تواند پروفایل خودش را مدیریت کند
    return next();
  }
  return res
    .status(403)
    .json({ message: "اجازه دسترسی به این پروفایل را ندارید!" });
};
