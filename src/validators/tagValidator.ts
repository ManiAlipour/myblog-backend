import { body } from "express-validator";

export const addTagValidator = [
  body("name")
    .notEmpty()
    .withMessage("نام تگ الزامی است.")
    .isLength({ min: 2, max: 64 })
    .withMessage("نام تگ باید بین ۲ تا ۶۴ کاراکتر باشد."),
  body("slug")
    .notEmpty()
    .withMessage("اسلاگ الزامی است.")
    .isSlug()
    .withMessage("اسلاگ باید معتبر باشد (فقط حروف کوچک، اعداد و خط تیره)."),
];

export const editTagValidator = [
  body("name")
    .optional()
    .isLength({ min: 2, max: 64 })
    .withMessage("نام تگ باید بین ۲ تا ۶۴ کاراکتر باشد."),
  body("slug")
    .optional()
    .isSlug()
    .withMessage("اسلاگ باید معتبر باشد (فقط حروف کوچک، اعداد و خط تیره)."),
];
