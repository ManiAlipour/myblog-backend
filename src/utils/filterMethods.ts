import _ from "lodash";
import {
  allowedCommentFields,
  allowedPostFields,
  SENSITIVE_USER_FIELDS,
} from "./constants/fields";
import { IPost } from "../models/Post";

export function filterComment(comment: any) {
  if (!comment) return null;

  const obj =
    typeof comment.toObject === "function" ? comment.toObject() : comment;
  const picked = _.pick(obj, allowedCommentFields);
  picked.id = picked._id?.toString();
  delete picked._id;
  return picked;
}

export function filterPost(post: IPost) {
  if (!post) return null;

  const obj = typeof post.toObject === "function" ? post.toObject() : post;
  const picked = _.pick(obj, allowedPostFields);
  picked.id = picked._id?.toString();
  delete picked._id;
  return picked;
}

export const filterUser = (user: any) => {
  if (!user) return null;

  const obj = typeof user.toObject === "function" ? user.toObject() : user;

  let filteredUser = _.omit(obj, SENSITIVE_USER_FIELDS) as Record<string, any>;
  filteredUser.id = filteredUser._id;
  delete filteredUser._id;

  return filteredUser;
};
