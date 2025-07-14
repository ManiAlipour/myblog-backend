import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";

export const canAccessOwnProfile = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  const paramId = req.params.id;
  if (!req.user || String(req.user._id) !== String(paramId)) {
    return res.status(403).json({ message: "اجازه دسترسی به این پروفایل را ندارید!" });
  }

  next();
};
