import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";

export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "دسترسی غیرمجاز!" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "دسترسی فقط برای ادمین مجاز است!" });
  }
  next();
}; 