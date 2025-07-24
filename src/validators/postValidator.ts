import { body } from "express-validator";

export const addPostValidator = [
  body("title")
    .notEmpty()
    .withMessage("عنوان پست الزامی است.")
    .isLength({ min: 3, max: 128 })
    .withMessage("عنوان پست باید بین ۳ تا ۱۲۸ کاراکتر باشد."),
  body("slug")
    .notEmpty()
    .withMessage("اسلاگ الزامی است.")
    .isSlug()
    .withMessage("اسلاگ باید معتبر باشد (فقط حروف کوچک، اعداد و خط تیره)."),
  body("content").notEmpty().withMessage("محتوای پست الزامی است."),
  body("categories")
    .optional()
    .isArray()
    .withMessage("دسته‌بندی‌ها باید آرایه باشند."),
  body("categories.*")
    .optional()
    .isMongoId()
    .withMessage("شناسه دسته‌بندی معتبر نیست."),
  body("tags").optional().isArray().withMessage("تگ‌ها باید آرایه باشند."),
  body("tags.*").optional().isString().withMessage("هر تگ باید یک رشته باشد."),
  body("published")
    .optional()
    .isBoolean()
    .withMessage("وضعیت انتشار باید بولین باشد."),
];

export const editPostValidator = [
  body("title")
    .optional()
    .isLength({ min: 3, max: 128 })
    .withMessage("عنوان پست باید بین ۳ تا ۱۲۸ کاراکتر باشد."),
  body("slug")
    .optional()
    .isSlug()
    .withMessage("اسلاگ باید معتبر باشد (فقط حروف کوچک، اعداد و خط تیره)."),
  body("content").optional(),
  body("author")
    .optional()
    .isMongoId()
    .withMessage("شناسه نویسنده معتبر نیست."),
  body("categories")
    .optional()
    .isArray()
    .withMessage("دسته‌بندی‌ها باید آرایه باشند."),
  body("categories.*")
    .optional()
    .isMongoId()
    .withMessage("شناسه دسته‌بندی معتبر نیست."),
  body("tags").optional().isArray().withMessage("تگ‌ها باید آرایه باشند."),
  body("tags.*").optional().isString().withMessage("هر تگ باید یک رشته باشد."),
  body("coverImage")
    .optional()
    .isURL()
    .withMessage("آدرس تصویر کاور باید معتبر باشد."),
  body("published")
    .optional()
    .isBoolean()
    .withMessage("وضعیت انتشار باید بولین باشد."),
];
