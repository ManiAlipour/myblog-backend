import { Request, Response } from "express";
import Post from "../../models/Post";
import { filterPost } from "../../utils/filterMethods";
import _ from "lodash";
import {
  useValidationResult,
  handleError,
  handleSuccess,
  objectIdPatternCheck,
} from "../../utils/authfunctionalities";
import messages, { STATUS_CODES } from "../../utils/constants/messages";
import s3 from "../../utils/constants/cloude";
import { AuthRequest } from "../../middleware/authMiddleware";

export async function getAllPosts(req: Request, res: Response) {
  try {
    const {
      search,
      sort,
      author,
      published,
      category,
      tag,
      page = 1,
      limit = 10,
    } = req.query;

    // Build query
    let query: any = {};
    if (search) {
      const regex = new RegExp(search as string, "i");
      query.$or = [{ title: regex }, { content: regex }, { tags: regex }];
    }
    if (author) {
      query.author = author;
    }
    if (published !== undefined) {
      if (published === "true") query.published = true;
      else if (published === "false") query.published = false;
    }
    if (category) {
      query.categories = category;
    }
    if (tag) {
      query.tags = tag;
    }

    // Sorting
    let sortOption: any = { createdAt: -1 }; // Default: newest
    if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "views") sortOption = { views: -1 };
    else if (sort === "likes") sortOption = { likes: -1 };
    else if (sort === "title") sortOption = { title: 1 };

    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 10, 100);
    const skip = (pageNum - 1) * limitNum;
    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate("author", "username name")
        .populate("categories", "name"),
      Post.countDocuments(query),
    ]);

    handleSuccess(
      res,
      posts.map((post) => filterPost(post)),
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

export async function getOnePost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!id || !objectIdPattern.test(id)) {
      return handleError(
        res,
        null,
        STATUS_CODES.BAD_REQUEST,
        messages.INVALID_POST_ID
      );
    }
    const post = await Post.findById(id)
      .populate("author", "username name")
      .populate("categories", "name");
    if (!post) {
      return handleError(
        res,
        null,
        STATUS_CODES.NOT_FOUND,
        messages.POST_NOT_FOUND
      );
    }
    handleSuccess(
      res,
      filterPost(post),
      messages.POST_RETRIEVED,
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

export async function addNewPost(req: AuthRequest, res: Response) {
  if (useValidationResult({ req, res })) return;

  const { title, slug, content, categories, tags, published } = req.body;

  try {
    const postWithSlug = await Post.findOne({ slug });

    if (postWithSlug)
      return handleError(
        res,
        null,
        STATUS_CODES.CONFLICT,
        messages.POST_WITH_SAME_SLUG_EXISTS
      );

    const excerpt = String(content).slice(0, 150);

    let coverImageUrl = null;
    if (req.file) {
      const filename = `${slug}-${Date.now()}-${req.file.originalname}`;

      const uploadResult = await s3
        .upload({
          Bucket: process.env.CLOUD_BUCKET_NAME as string,
          Key: `covers/${filename}`,
          Body: req.file.buffer,
          ACL: "public-read",
          ContentType: req.file.mimetype,
        })
        .promise();

      coverImageUrl = uploadResult.Location; // URL فایل آپلود شده
    }
    const post = new Post({
      title,
      slug,
      content,
      author: req.user._id,
      categories,
      excerpt,
      tags,
      coverImage: coverImageUrl,
      published: typeof published === "boolean" ? published : false,
    });

    const savedPost = await post.save();

    handleSuccess(
      res,
      filterPost(savedPost),
      messages.POST_ADDED,
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

export async function editPost(req: AuthRequest, res: Response) {
  if (useValidationResult({ req, res })) return;

  const { id } = req.params;
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  if (!id || !objectIdPattern.test(id)) {
    return handleError(
      res,
      null,
      STATUS_CODES.BAD_REQUEST,
      messages.INVALID_POST_ID
    );
  }

  try {
    const post = await Post.findById(id);
    if (!post) {
      return handleError(
        res,
        null,
        STATUS_CODES.NOT_FOUND,
        messages.POST_NOT_FOUND
      );
    }
    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return handleError(
        res,
        null,
        STATUS_CODES.FORBIDDEN,
        messages.NO_PERMISSION_TO_EDIT_POST
      );
    }

    if (req.body.slug && req.body.slug !== post.slug) {
      const duplicate = await Post.findOne({
        slug: req.body.slug,
        _id: { $ne: post._id },
      });
      if (duplicate)
        return handleError(
          res,
          null,
          STATUS_CODES.CONFLICT,
          messages.DUPLICATE_SLUG
        );
    }

    const updatableFields = [
      "title",
      "slug",
      "content",
      "categories",
      "tags",
      "coverImage",
      "published",
    ];
    const data = _.pick(req.body, updatableFields);
    Object.assign(post, data);

    if (req.body.published === true && !post.publishedAt) {
      post.publishedAt = new Date();
    }
    await post.save();

    await post.populate("author", "username name");
    await post.populate("categories", "name");
    handleSuccess(res, filterPost(post), messages.POST_EDITED, STATUS_CODES.OK);
  } catch (error) {
    handleError(
      res,
      error,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      messages.SERVER_CONNECTION_ERROR
    );
  }
}

export async function deletePost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!id || !objectIdPattern.test(id)) {
      return handleError(
        res,
        null,
        STATUS_CODES.BAD_REQUEST,
        messages.INVALID_POST_ID
      );
    }
    const post = await Post.findById(id);
    if (!post) {
      return handleError(
        res,
        null,
        STATUS_CODES.NOT_FOUND,
        messages.POST_NOT_FOUND
      );
    }
    await Post.findByIdAndDelete(id);
    handleSuccess(
      res,
      filterPost(post),
      messages.POST_DELETED,
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

export async function addPostView(req: Request, res: Response) {
  const { id } = req.params;

  try {
    if (!id || !objectIdPatternCheck(id))
      return handleError(
        res,
        null,
        STATUS_CODES.BAD_REQUEST,
        messages.INVALID_POST_ID
      );

    const post = await Post.findById(id);
    post.view += 1;

    const savedPost = await post.save();

    return handleSuccess(res, filterPost(savedPost));
  } catch (error) {
    handleError(
      res,
      error,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      messages.SERVER_CONNECTION_ERROR
    );
  }
}

export async function setLike(req: Request, res: Response) {
  const { id, action = "increase" } = req.params;

  try {
    if (!id || !objectIdPatternCheck(id))
      return handleError(
        res,
        null,
        STATUS_CODES.BAD_REQUEST,
        messages.INVALID_POST_ID
      );

    const post = await Post.findById(id);

    if (action === "decrease") post.likes -= 1;
    else post.likes += 1;

    return handleSuccess(
      res,
      post.likes,
      action === "increase" ? messages.LIKE_ADDED : messages.LIKE_DELETED
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
