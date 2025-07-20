const messages = {
  SUCCESS: "عملیات با موفقیت انجام شد.",
  ERROR: "خطایی رخ داده است.",
  NOT_FOUND: "موردی یافت نشد.",
  UNAUTHORIZED: "دسترسی غیرمجاز.",
  FORBIDDEN: "شما اجازه دسترسی به این بخش را ندارید.",
  VALIDATION_ERROR: "اطلاعات وارد شده معتبر نیست.",
  LOGIN_SUCCESS: "ورود با موفقیت انجام شد.",
  LOGIN_FAILED: "نام کاربری یا رمز عبور اشتباه است.",
  REGISTER_SUCCESS: "ثبت‌نام با موفقیت انجام شد.",
  REGISTER_FAILED: "ثبت‌نام انجام نشد.",
  LOGOUT_SUCCESS: "خروج با موفقیت انجام شد.",
  UPDATE_SUCCESS: "بروزرسانی با موفقیت انجام شد.",
  DELETE_SUCCESS: "حذف با موفقیت انجام شد.",
  ALREADY_EXISTS: "این مورد قبلاً ثبت شده است.",
  PASSWORD_CHANGED: "رمز عبور با موفقیت تغییر کرد.",
  PASSWORD_INCORRECT: "رمز عبور فعلی اشتباه است.",

  // UserController
  SERVER_ERROR: "خطای ارتباط با سرور.",
  USER_NOT_FOUND: "کاربر پیدا نشد!",
  VERIFICATION_CODE_NOT_SET: "کد ورودی برای کاربر ست نشده است.",
  INVALID_OR_EXPIRED_CODE: "کد نامعتبر است یا منقضی شده است!",
  EMAIL_VERIFICATION_SUCCESS: "اعتبارسنجی ایمیل با موفقیت انجام شد.",
  USER_NOT_FOUND_BY_EMAIL: "کاربری با ایمیل مدنظر پیدا نشد!",
  INCORRECT_PASSWORD: "رمز عبور اشتباه است!",
  PROFILE_RETRIEVED_SUCCESS: "پروفایل با موفقیت دریافت شد.",
  USERNAME_ALREADY_USED_BY_ANOTHER_USER:
    "این نام کاربری قبلاً توسط کاربر دیگری ثبت شده است.",
  PROFILE_UPDATED_SUCCESS: "پروفایل با موفقیت ویرایش شد.",
  INVALID_USER_ID: "شناسه کاربر نامعتبر است.",
  USER_FOUND_SUCCESS: "کاربر با موفقیت پیدا شد.",
  USERS_LIST_RETRIEVED_SUCCESS: "لیست کاربران با موفقیت دریافت شد.",
  USER_ALREADY_LOGEDOUT: "کاربر قبلا از حساب کاربری خود خارج شده است",

  // PostsController
  POSTS_LIST_RETRIEVED: "لیست پست‌ها با موفقیت دریافت شد.",
  SERVER_CONNECTION_ERROR: "خطای ارتباط با سرور.",
  INVALID_POST_ID: "شناسه پست نامعتبر است.",
  POST_NOT_FOUND: "پست پیدا نشد!",
  POST_RETRIEVED: "پست با موفقیت دریافت شد.",
  POST_WITH_SAME_SLUG_EXISTS: "پست با این اسلاگ قبلا ثبت شده است.",
  POST_ADDED: "پست با موفقیت افزوده شد.",
  NO_PERMISSION_TO_EDIT_POST: "شما اجازه ویرایش این پست را ندارید.",
  DUPLICATE_SLUG: "اسلاگ وارد شده تکراری است.",
  POST_EDITED: "پست با موفقیت ویرایش شد.",
  POST_DELETED: "پست با موفقیت حذف شد.",

  // CommentsController
  COMMENTS_LIST_RECEIVED: "لیست نظرات با موفقیت دریافت شد.",
  INVALID_COMMENT_ID: "شناسه کامنت نامعتبر است.",
  COMMENT_NOT_FOUND: "کامنت یافت نشد.",
  PARENT_COMMENT_NOT_FOUND_OR_NOT_RELATED:
    "کامنت والد یافت نشد یا متعلق به این پست نیست.",
  COMMENT_ADDED_SUCCESSFULLY: "کامنت با موفقیت اضافه شد.",
  COMMENT_DELETED_SUCCESSFULLY: "کامنت با موفقیت حذف شد.",
  NO_PERMISSION_TO_DELETE_COMMENT: "شما دسترسی به حذف این کامنت را ندارید.",
  INVALID_STATUS_VALUE: "مقدار وضعیت نامعتبر وارد شده است.",
  COMMENT_STATUS_CHANGED: "وضعیت کامنت با موفقیت تغییر کرد.",

  // MetaController
  // Category (دسته‌بندی)
  ERROR_FETCHING_CATEGORIES: "خطا در دریافت دسته‌بندی‌ها.",
  INVALID_CATEGORY_ID: "شناسه ی دسته بندی نامعتبر.",
  CATEGORY_LIST_RETRIEVED: "لیست دسته‌بندی‌ها با موفقیت دریافت شد.",
  CATEGORY_ADDED: "دسته‌بندی با موفقیت افزوده شد.",
  CATEGORY_EXISTS: "دسته‌بندی با این اسلاگ قبلاً ثبت شده است.",
  CATEGORY_NOT_FOUND: "دسته‌بندی پیدا نشد!",
  CATEGORY_EDITED: "دسته‌بندی با موفقیت ویرایش شد.",
  CATEGORY_DELETED: "دسته‌بندی با موفقیت حذف شد.",

  // Tag (برچسب)
  TAG_LIST_RETRIEVED: "لیست برچسب‌ها با موفقیت دریافت شد.",
  INVALID_TAG_ID: "شناسه ی برچسب نامعتبر.",
  TAG_ADDED: "برچسب با موفقیت افزوده شد.",
  TAG_EXISTS: "برچسب با این اسلاگ قبلاً ثبت شده است.",
  TAG_NOT_FOUND: "برچسب پیدا نشد!",
  TAG_EDITED: "برچسب با موفقیت ویرایش شد.",
  TAG_DELETED: "برچسب با موفقیت حذف شد.",

  // like
  LIKE_DELETED: "لایک با موفقیت حذف شد.",
  LIKE_ADDED: "لایک با موفقیت افزوده شد.",
  LIKE_COUNT_RETRIEVED: "تعداد لایک‌ها با موفقیت دریافت شد.",
  NO_LIKES: "کاربر پستی را لایک نکرده است.",
};

export default messages;

export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,

  UNPROCESSABLE_ENTITY: 422,

  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};
