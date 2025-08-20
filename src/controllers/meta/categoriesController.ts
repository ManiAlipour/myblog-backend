import { Request, Response } from "express";
import Category from "../../models/Category";
import {
  useValidationResult,
  handleError,
  handleSuccess,
  objectIdPatternCheck,
} from "../../utils/funcs/authfunctionalities";
import messages, { STATUS_CODES } from "../../utils/constants/messages";
import { filterCategory, filterPost } from "../../utils/funcs/filterMethods";
import Post from "../../models/Post";

export async function getAllCategories(req: Request, res: Response) {
  try {
    const categories = await Category.find({});
    handleSuccess(res, categories, messages.SUCCESS, STATUS_CODES.OK);
  } catch (error) {
    handleError(
      res,
      null,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      messages.ERROR_FETCHING_CATEGORIES
    );
  }
}

export async function addNewCategory(req: Request, res: Response) {
  if (useValidationResult({ req, res })) return;

  let { name, slug, description } = req.body;
  name = name?.trim();
  slug = slug?.trim().toLowerCase();

  try {
    const isCategoryValid = await Category.findOne({ slug });

    if (isCategoryValid)
      return handleError(
        res,
        null,
        STATUS_CODES.BAD_REQUEST,
        messages.CATEGORY_EXISTS
      );

    const category = new Category({
      name,
      slug,
      description,
    });

    const savedCategory = await category.save();

    return handleSuccess(
      res,
      filterCategory(savedCategory),
      messages.CATEGORY_ADDED,
      STATUS_CODES.CREATED
    );
  } catch (error) {
    handleError(
      res,
      error,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      messages.SERVER_CONNECTION_ERROR
    );
  }
}

export async function getOneCategory(req: Request, res: Response) {
  const { id } = req.params;

  try {
    if (!objectIdPatternCheck(id))
      return handleError(
        res,
        null,
        STATUS_CODES.FORBIDDEN,
        messages.INVALID_CATEGORY_ID
      );

    const category = await Category.findById(id);

    if (!category)
      return handleError(
        res,
        null,
        STATUS_CODES.BAD_REQUEST,
        messages.CATEGORY_NOT_FOUND
      );

    return handleSuccess(
      res,
      filterCategory(category),
      messages.CATEGORY_LIST_RETRIEVED
    );
  } catch (error) {
    handleError(
      res,
      error,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      messages.SERVER_CONNECTION_ERROR
    );
  }
}

export async function getPostWithCategory(req: Request, res: Response) {
  try {
    const { id, slug } = req.query;
    const categoryQuery: Record<string, any> = {};

    if (id) {
      if (!objectIdPatternCheck(id)) {
        return handleError(
          res,
          null,
          STATUS_CODES.BAD_REQUEST,
          messages.INVALID_CATEGORY_ID
        );
      }
      categoryQuery._id = id;
    } else if (slug) {
      categoryQuery.slug = slug;
    } else {
      return handleError(
        res,
        null,
        STATUS_CODES.BAD_REQUEST,
        messages.INVALID_CATEGORY_ID
      );
    }

    const category = await Category.findOne(categoryQuery);
    if (!category) {
      return handleError(
        res,
        null,
        STATUS_CODES.NOT_FOUND,
        messages.CATEGORY_NOT_FOUND
      );
    }

    const posts = await Post.find({ categories: category._id })
      .populate("author", "name avatar")
      .populate("categories", "name");

    return handleSuccess(
      res,
      posts.map(filterPost),
      messages.POSTS_LIST_RETRIEVED,
      STATUS_CODES.OK
    );
  } catch (error) {
    handleError(
      res,
      error,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      messages.SERVER_CONNECTION_ERROR
    );
  }
}

export async function editCategory(req: Request, res: Response) {
  if (useValidationResult({ req, res })) return;

  const { id } = req.params;

  try {
    if (!objectIdPatternCheck(id))
      return handleError(
        res,
        null,
        STATUS_CODES.FORBIDDEN,
        messages.INVALID_CATEGORY_ID
      );

    const category = await Category.findById(id);
    if (!category)
      return handleError(
        res,
        null,
        STATUS_CODES.BAD_REQUEST,
        messages.CATEGORY_NOT_FOUND
      );

    const { name, slug, description } = req.body;
    if (name !== undefined) category.name = name.trim();
    if (slug !== undefined) category.slug = slug.trim().toLowerCase();
    if (description !== undefined) category.description = description.trim();
    await category.save();

    return handleSuccess(
      res,
      filterCategory(category),
      messages.CATEGORY_EDITED,
      STATUS_CODES.OK
    );
  } catch (error) {
    handleError(res, error, STATUS_CODES.INTERNAL_SERVER_ERROR, messages.ERROR);
  }
}

export async function deleteCategory(req: Request, res: Response) {
  const { id } = req.params;

  try {
    if (!objectIdPatternCheck(id))
      return handleError(
        res,
        null,
        STATUS_CODES.FORBIDDEN,
        messages.INVALID_CATEGORY_ID
      );

    const category = await Category.findById(id);
    if (!category)
      return handleError(
        res,
        null,
        STATUS_CODES.BAD_REQUEST,
        messages.CATEGORY_NOT_FOUND
      );
    await Category.findByIdAndDelete(id);

    return handleSuccess(
      res,
      filterCategory(category),
      messages.CATEGORY_DELETED,
      STATUS_CODES.OK
    );
  } catch (error) {
    handleError(res, error, STATUS_CODES.INTERNAL_SERVER_ERROR, messages.ERROR);
  }
}
