import { Request, Response } from "express";
import Post from "../models/Post";
import { validationResult } from "express-validator";
import { filterPost, filterComment } from "../utils/authfunctionalities";
import { AuthRequest } from "../middleware/authMiddleware";
import _ from "lodash";
import Comment from "../models/Comment";

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

    res.json({
      success: true,
      message: "لیست پست‌ها با موفقیت دریافت شد.",
      data: posts.map((post) => filterPost(post)),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "خطای ارتباط با سرور." });
  }
}

export async function getOnePost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!id || !objectIdPattern.test(id)) {
      return res
        .status(400)
        .json({ success: false, error: "شناسه پست نامعتبر است." });
    }
    const post = await Post.findById(id)
      .populate("author", "username name")
      .populate("categories", "name");
    if (!post) {
      return res.status(404).json({ success: false, error: "پست پیدا نشد!" });
    }
    res.json({
      success: true,
      message: "پست با موفقیت دریافت شد.",
      data: filterPost(post),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "خطای ارتباط با سرور." });
  }
}

export async function addNewPost(req: AuthRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array() });
  }

  const { title, slug, content, categories, tags, coverImage, published } =
    req.body;

  try {
    const postWithSlug = await Post.findOne({ slug });

    if (postWithSlug)
      return res.status(409).json({
        success: false,
        message: "پست با این اسلاگ قبلا ثبت شده است",
      });

    const post = new Post({
      title,
      slug,
      content,
      author: req.user._id,
      categories,
      tags,
      coverImage: coverImage || null,
      published: typeof published === "boolean" ? published : false,
    });

    const savedPost = await post.save();

    res.json({
      success: true,
      message: "پست با موفقیت افزوده شد",
      data: filterPost(savedPost.toObject()),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "خطای ارتباط با سرور." });
  }
}

export async function editPost(req: AuthRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array() });
  }

  const { id } = req.params;
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  if (!id || !objectIdPattern.test(id)) {
    return res
      .status(400)
      .json({ success: false, error: "شناسه پست نامعتبر است." });
  }

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, error: "پست پیدا نشد!" });
    }
    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, error: "شما اجازه ویرایش این پست را ندارید." });
    }

    if (req.body.slug && req.body.slug !== post.slug) {
      const duplicate = await Post.findOne({
        slug: req.body.slug,
        _id: { $ne: post._id },
      });
      if (duplicate)
        return res
          .status(409)
          .json({ success: false, error: "اسلاگ وارد شده تکراری است." });
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
    res.json({
      success: true,
      message: "پست با موفقیت ویرایش شد.",
      data: filterPost(post),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "خطای ارتباط با سرور." });
  }
}

export async function deletePost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!id || !objectIdPattern.test(id)) {
      return res
        .status(400)
        .json({ success: false, error: "شناسه پست نامعتبر است." });
    }
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, error: "پست پیدا نشد!" });
    }
    await Post.findByIdAndDelete(id);
    res.json({
      success: true,
      message: "پست با موفقیت حذف شد.",
      data: filterPost(post.toObject()),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "خطای ارتباط با سرور." });
  }
}


