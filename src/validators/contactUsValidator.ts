import { body } from "express-validator";

export const messageValidation = [
  body("title")
    .notEmpty()
    .withMessage("عنوان پیام الزامی است.")
    .isLength({ min: 3, max: 100 })
    .withMessage("عنوان باید بین ۳ تا ۱۰۰ کاراکتر باشد.")
    .matches(/^[^<>[\]{}]+$/)
    .withMessage("عنوان نباید شامل کاراکترهای غیرمجاز یا تگ HTML باشد."),

  body("content")
    .notEmpty()
    .withMessage("متن پیام الزامی است.")
    .isLength({ min: 5, max: 2000 })
    .withMessage("متن پیام باید بین ۵ تا ۲۰۰۰ کاراکتر باشد."),
];
