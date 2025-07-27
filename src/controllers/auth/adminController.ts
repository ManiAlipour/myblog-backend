import { Request, Response } from "express";
import { handleError, handleSuccess } from "../../utils/funcs/authfunctionalities";
import messages from "../../utils/constants/messages";
import { filterUser, filterPost, filterComment } from "../../utils/funcs/filterMethods";
import User from "../../models/User";
import Post from "../../models/Post";
import Comment from "../../models/Comment";

export async function getAllUsers(req: Request, res: Response) {
  try {
    const { search, id, sort, role, status } = req.query;
    // Search by ID (exact) with ObjectId validation
    if (id) {
      const objectIdPattern = /^[0-9a-fA-F]{24}$/;
      if (typeof id !== "string" || !objectIdPattern.test(id)) {
        return handleError(res, null, 400, messages.INVALID_USER_ID);
      }
      const user = await User.findById(id as string);
      if (!user) {
        return handleError(res, null, 404, messages.USER_NOT_FOUND);
      }
      return handleSuccess(
        res,
        [filterUser(user)],
        messages.USER_FOUND_SUCCESS,
        200
      );
    }

    // Search by text (username, name, email)
    let query: any = {};
    if (search) {
      const regex = new RegExp(search as string, "i");
      query.$or = [{ username: regex }, { name: regex }, { email: regex }];
    }
    // Filter by role
    if (role) {
      query.role = role;
    }
    // Filter by status (isActive)
    if (status !== undefined) {
      if (status === "active") query.isActive = true;
      else if (status === "inactive") query.isActive = false;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    let sortOption: any = { createdAt: -1 }; // Default: newest
    if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "username") sortOption = { username: 1 };
    else if (sort === "email") sortOption = { email: 1 };
    else if (sort === "name") sortOption = { name: 1 };
    else if (sort === "role") sortOption = { role: 1 };

    const [users, total] = await Promise.all([
      User.find(query).sort(sortOption).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    const filteredUsers = users.map((user) => filterUser(user));
    return handleSuccess(
      res,
      {
        data: filteredUsers,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      messages.USERS_LIST_RETRIEVED_SUCCESS,
      200
    );
  } catch (error) {
    handleError(res, error, 500, messages.SERVER_ERROR);
  }
}

export async function getAllPostsAdmin(req: Request, res: Response) {
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

    let sortOption: any = { createdAt: -1 };
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

    return handleSuccess(
      res,
      {
        data: posts.map((post) => filterPost(post)),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
      messages.POSTS_LIST_RETRIEVED,
      200
    );
  } catch (error) {
    handleError(res, error, 500, messages.SERVER_ERROR);
  }
}

export async function getAllCommentsAdmin(req: Request, res: Response) {
  try {
    const { page = 1, limit = 10, sort = "newest" } = req.query;

    let sortOption: any = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };

    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 10, 100);
    const skip = (pageNum - 1) * limitNum;

    const [comments, total] = await Promise.all([
      Comment.find()
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate("author", "username name avatar")
        .populate("post", "title"),
      Comment.countDocuments(),
    ]);

    return handleSuccess(
      res,
      {
        data: comments.map((comment) => filterComment(comment)),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
      messages.COMMENTS_LIST_RECEIVED,
      200
    );
  } catch (error) {
    handleError(res, error, 500, messages.SERVER_ERROR);
  }
}

export async function getDashboardInfo(req: Request, res: Response) {
  try {
    const [userCount, postCount, commentCount] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Comment.countDocuments(),
    ]);

    return handleSuccess(
      res,
    {
        users: userCount,
        posts: postCount,
        comments: commentCount,
      },
      messages.DASHBOARD_INFO_RETRIEVED,
      200
    );
  } catch (error) {
    handleError(res, error, 500, messages.SERVER_ERROR);
  }
}
