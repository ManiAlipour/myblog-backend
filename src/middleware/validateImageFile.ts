import { NextFunction, Request, Response } from "express";

export default function validateImageFile(req: Request, res: Response, next: NextFunction) {
  if (!req.file) return next(); // بودن فایل اختیاریه

  if (req.file.size > 5 * 1024 * 1024)
    return res.status(400).json({ message: "حداکثر حجم تصویر 5 مگابایت است." });
  // mime-type
  if (!["image/jpeg", "image/png", "image/webp"].includes(req.file.mimetype))
    return res
      .status(400)
      .json({ message: "فقط تصاویر JPG، PNG یا WEBP مجاز هستند." });

  next();
}
