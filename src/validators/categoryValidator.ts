import { body } from "express-validator";

export const addCategoryValidator = [
  body("name")
    .notEmpty()
    .withMessage("نام دسته‌بندی الزامی است.")
    .isLength({ min: 2, max: 64 })
    .withMessage("نام دسته‌بندی باید بین ۲ تا ۶۴ کاراکتر باشد."),
  body("slug")
    .notEmpty()
    .withMessage("اسلاگ الزامی است.")
    .isSlug()
    .withMessage("اسلاگ باید معتبر باشد (فقط حروف کوچک، اعداد و خط تیره)."),
  body("description")
    .optional()
    .isLength({ max: 256 })
    .withMessage("توضیحات نمی‌تواند بیشتر از ۲۵۶ کاراکتر باشد."),
];

export const editCategoryValidator = [
  body("name")
    .optional()
    .isLength({ min: 2, max: 64 })
    .withMessage("نام دسته‌بندی باید بین ۲ تا ۶۴ کاراکتر باشد."),
  body("slug")
    .optional()
    .isSlug()
    .withMessage("اسلاگ باید معتبر باشد (فقط حروف کوچک، اعداد و خط تیره)."),
  body("description")
    .optional()
    .isLength({ max: 256 })
    .withMessage("توضیحات نمی‌تواند بیشتر از ۲۵۶ کاراکتر باشد."),
];
