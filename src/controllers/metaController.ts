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
import Tag from "../models/Tag";
import { filterTag } from "../utils/filterMethods";

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

export async function getAllTags(req: Request, res: Response) {
  try {
    const tags = await Tag.find({});
    handleSuccess(res, tags.map(filterTag), messages.TAG_LIST_RETRIEVED, 200);
  } catch (error) {
    handleError(res, error, 500, messages.ERROR);
  }
}

export async function addNewTag(req: AuthRequest, res: Response) {
  if (useValidationResult({ req, res })) return;
  let { name, slug } = req.body;
  name = name?.trim();
  slug = slug?.trim().toLowerCase();
 
  try {
    const isTagValid = await Tag.findOne({ slug });
   
    if (isTagValid) return handleError(res, null, 400, messages.TAG_EXISTS);
   
    const tag = new Tag({ name, slug });
    const savedTag = await tag.save();
   
    return handleSuccess(res, filterTag(savedTag), messages.TAG_ADDED, 201);
  } catch (error) {
    handleError(res, error, 500, messages.ERROR);
  }
}

export async function getOneTag(req: Request, res: Response) {
  const { id } = req.params;
  
  try {
    if (!objectIdPatternCheck(id))
      return handleError(res, null, 403, messages.INVALID_TAG_ID);
  
    const tag = await Tag.findById(id);
  
    if (!tag) return handleError(res, null, 400, messages.TAG_NOT_FOUND);
  
    return handleSuccess(res, filterTag(tag), messages.TAG_LIST_RETRIEVED, 200);
  } catch (error) {
    handleError(res, error, 500, messages.ERROR);
  }
}

export async function editTag(req: AuthRequest, res: Response) {
  if (useValidationResult({ req, res })) return;
 
  const { id } = req.params;
 
  try {
    if (!objectIdPatternCheck(id))
      return handleError(res, null, 403, messages.INVALID_TAG_ID);
 
    const tag = await Tag.findById(id);
 
    if (!tag) return handleError(res, null, 400, messages.TAG_NOT_FOUND);
 
    const { name, slug } = req.body;
 
    if (name !== undefined) tag.name = name.trim();
    if (slug !== undefined) tag.slug = slug.trim().toLowerCase();
    await tag.save();
 
    return handleSuccess(res, filterTag(tag), messages.TAG_EDITED, 200);
  } catch (error) {
    handleError(res, error, 500, messages.ERROR);
  }
}

export async function deleteTag(req: AuthRequest, res: Response) {
  const { id } = req.params;
 
  try {
    if (!objectIdPatternCheck(id))
      return handleError(res, null, 403, messages.INVALID_TAG_ID);
 
    const tag = await Tag.findById(id);
    if (!tag) return handleError(res, null, 400, messages.TAG_NOT_FOUND);
    await Tag.findByIdAndDelete(id);
 
    return handleSuccess(res, filterTag(tag), messages.TAG_DELETED, 200);
  } catch (error) {
    handleError(res, error, 500, messages.ERROR);
  }
}

export async function editCategory(req: AuthRequest, res: Response) {
  if (useValidationResult({ req, res })) return;
 
  const { id } = req.params;
 
  try {
    if (!objectIdPatternCheck(id))
      return handleError(res, null, 403, messages.INVALID_CATEGORY_ID);
 
    const category = await Category.findById(id);
    if (!category)
      return handleError(res, null, 400, messages.CATEGORY_NOT_FOUND);
 
    const { name, slug, description } = req.body;
    if (name !== undefined) category.name = name.trim();
    if (slug !== undefined) category.slug = slug.trim().toLowerCase();
    if (description !== undefined) category.description = description.trim();
    await category.save();
 
    return handleSuccess(
      res,
      filterCategory(category),
      messages.CATEGORY_EDITED,
      200
    );
  } catch (error) {
    handleError(res, error, 500, messages.ERROR);
  }
}

export async function deleteCategory(req: AuthRequest, res: Response) {
  const { id } = req.params;
 
  try {
    if (!objectIdPatternCheck(id))
      return handleError(res, null, 403, messages.INVALID_CATEGORY_ID);
 
    const category = await Category.findById(id);
    if (!category)
      return handleError(res, null, 400, messages.CATEGORY_NOT_FOUND);
    await Category.findByIdAndDelete(id);
 
    return handleSuccess(
      res,
      filterCategory(category),
      messages.CATEGORY_DELETED,
      200
    );
  } catch (error) {
    handleError(res, error, 500, messages.ERROR);
  }
}
