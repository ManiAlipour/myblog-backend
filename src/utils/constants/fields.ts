export const allowedPostFields = [
  "_id",
  "title",
  "slug",
  "excerpt",
  "author",
  "coverImage",
  "categories",
  "tags",
  "published",
  "publishedAt",
  "updatedAt",
  "createdAt",
  "views",
  "likes",
];

export const allowedCommentFields = [
  "_id",
  "post",
  "author",
  "content",
  "parent",
  "createdAt",
  "updatedAt",
  "isApproved",
];

export const allowedCategoryFields = [
  "_id",
  "name",
  "slug",
  "description",
  "createdAt",
  "updatedAt",
];

export const allowedTagFields = [
  "_id",
  "name",
  "slug",
  "createdAt",
  "updatedAt",
];

export const SENSITIVE_USER_FIELDS = [
  "password",
  "verificationCode",
  "verificationCodeExpires",
  "__v",
  // "resetToken",
  "isActive",
];
