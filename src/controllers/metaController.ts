import { Request, Response } from "express";
import Category from "../models/Category";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  useValidationResult,
  handleError,
  handleSuccess,
  objectIdPatternCheck,
} from "../utils/authfunctionalities";
import messages from "../utils/constants/messages";
import { filterCategory } from "../utils/filterMethods";
import Post from "../models/Post";
import { filterPost } from "../utils/filterMethods";

export async function getAllCategories(req: Request, res: Response) {
  try {
    const categories = await Category.find({});
    handleSuccess(res, categories, messages.SUCCESS, 200);
  } catch (error) {
    handleError(res, null, 500, messages.ERROR_FETCHING_CATEGORIES);
  }
}

export async function addNewCategory(req: AuthRequest, res: Response) {
  if (useValidationResult({ req, res })) return;

  let { name, slug, description } = req.body;
  name = name?.trim();
  slug = slug?.trim().toLowerCase();

  try {
    const isCategoryValid = await Category.findOne({ slug });

    if (isCategoryValid)
      return handleError(res, null, 400, messages.CATEGORY_EXISTS);

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
      201
    );
  } catch (error) {
    handleError(res, error, 500, messages.SERVER_CONNECTION_ERROR);
  }
}

export async function getOneCategory(req: Request, res: Response) {
  const { id } = req.params;

  try {
    if (!objectIdPatternCheck(id))
      return handleError(res, null, 403, messages.INVALID_CATEGORY_ID);

    const category = await Category.findById(id);

    if (!category)
      return handleError(res, null, 400, messages.CATEGORY_NOT_FOUND);

    return handleSuccess(
      res,
      filterCategory(category),
      messages.CATEGORY_LIST_RETRIEVED
    );
  } catch (error) {
    handleError(res, error, 500, messages.SERVER_CONNECTION_ERROR);
  }
}

export async function getPostWithCategory(req: Request, res: Response) {
  try {
    const { id, slug } = req.query;
    let categoryQuery: any = {};
    if (id) {
      if (!objectIdPatternCheck(id))
        return handleError(res, null, 400, messages.INVALID_CATEGORY_ID);
      categoryQuery._id = id;
    } else if (slug) {
      categoryQuery.slug = slug;
    } else {
      return handleError(res, null, 400, messages.INVALID_CATEGORY_ID);
    }

    const category = await Category.findOne(categoryQuery);
    if (!category) {
      return handleError(res, null, 404, messages.CATEGORY_NOT_FOUND);
    }

    const posts = await Post.find({ categories: category._id })
      .populate("author", "username name")
      .populate("categories", "name");

    return handleSuccess(
      res,
      posts.map((post) => filterPost(post)),
      messages.POSTS_LIST_RETRIEVED,
      200
    );
  } catch (error) {
    handleError(res, error, 500, messages.SERVER_CONNECTION_ERROR);
  }
}
