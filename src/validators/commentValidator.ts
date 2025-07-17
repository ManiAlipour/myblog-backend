import { body, param } from "express-validator";

export const addCommentValidator = [
  param("id")
    .notEmpty()
    .withMessage("شناسه پست الزامی است.")
    .isMongoId()
    .withMessage("شناسه پست معتبر نیست."),
  body("content")
    .notEmpty()
    .withMessage("متن کامنت الزامی است.")
    .isLength({ min: 1, max: 1000 })
    .withMessage("متن کامنت باید بین ۱ تا ۱۰۰۰ کاراکتر باشد."),
  body("parent")
    .optional()
    .isMongoId()
    .withMessage("شناسه کامنت والد معتبر نیست."),
];
