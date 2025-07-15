import { body } from "express-validator";

export const registerValidator = [
  body("username")
    .notEmpty()
    .withMessage("نام کاربری الزامی است.")
    .isLength({ min: 3, max: 32 })
    .withMessage("نام کاربری باید بین ۳ تا ۳۲ کاراکتر باشد."),
  body("email")
    .notEmpty()
    .withMessage("ایمیل الزامی است.")
    .isEmail()
    .withMessage("ایمیل معتبر نیست."),
  body("password")
    .notEmpty()
    .withMessage("رمز عبور الزامی است.")
    .isLength({ min: 6 })
    .withMessage("رمز عبور باید حداقل ۶ کاراکتر باشد."),
];

export const loginValidator = [
  body("email")
    .notEmpty()
    .withMessage("ایمیل الزامی است.")
    .isEmail()
    .withMessage("ایمیل معتبر نیست."),
  body("password").notEmpty().withMessage("رمز عبور الزامی است."),
];

export const editProfileValidator = [
  body("username")
    .optional()
    .isLength({ min: 3, max: 32 })
    .withMessage("نام کاربری باید بین ۳ تا ۳۲ کاراکتر باشد."),
  body("name")
    .optional()
    .isLength({ max: 64 })
    .withMessage("نام نمی‌تواند بیشتر از ۶۴ کاراکتر باشد."),
  body("bio")
    .optional()
    .isLength({ max: 256 })
    .withMessage("بیوگرافی نمی‌تواند بیشتر از ۲۵۶ کاراکتر باشد."),
  body("avatar")
    .optional()
    .isURL()
    .withMessage("آواتار باید یک آدرس معتبر باشد."),
];
