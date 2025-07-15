import { Request, Response } from "express";
import Post from "../models/Post";

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
      data: posts,
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
      data: post,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "خطای ارتباط با سرور." });
  }
}

export async function addNewPost(req: Request, res: Response) {}

export async function editPost(req: Request, res: Response) {}

export async function deletePost(req: Request, res: Response) {}
