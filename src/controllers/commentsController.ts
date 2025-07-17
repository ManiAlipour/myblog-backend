import { Request, Response } from "express";
import Comment from "../models/Comment";
import Post from "../models/Post";
import {
  deleteCommentAndChildren,
  objectIdPatternCheck,
  useValidationResult,
} from "../utils/authfunctionalities";
import { AuthRequest } from "../middleware/authMiddleware";
import { filterComment } from "../utils/filterMethods";

export async function getPostComments(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!id || !objectIdPattern.test(id)) {
      return res
        .status(400)
        .json({ success: false, error: "شناسه پست نامعتبر است." });
    }

    const comments = await Comment.find({ post: id, isApproved: true })
      .populate("author", "username name avatar")
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      message: "لیست نظرات با موفقیت دریافت شد.",
      data: comments.map((comment: any) => filterComment(comment)),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "خطای ارتباط با سرور." });
  }
}

export async function addCommentToPost(req: AuthRequest, res: Response) {
  if (useValidationResult({ req, res })) return;

  const { id } = req.params;
  const { content, parent = null } = req.body;

  try {
    const post = await Post.findById(id);

    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "پستی با این شناسه یافت نشد" });

    if (parent) {
      const parentComment = await Comment.findById(parent);
      if (!parentComment || parentComment.post.toString() !== id) {
        return res.status(400).json({
          success: false,
          message: "کامنت والد یافت نشد یا متعلق به این پست نیست",
        });
      }
    }

    const comment = new Comment({
      post: id,
      author: req.user.id,
      content,
      ...(parent ? { parent } : {}),
    });

    const savedComment = await comment.save();

    await savedComment.populate("author", "username name");

    res.status(201).json({
      success: true,
      message: "کامنت با موفقیت اضافه شد",
      data: filterComment(savedComment.toObject()),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "خطا در ارتباط با سرور" });
  }
}

export async function deleteComment(req: AuthRequest, res: Response) {
  const { id } = req.params;

  try {
    if (!objectIdPatternCheck(id))
      return res
        .status(400)
        .json({ success: false, message: "شناسه کامنت نامعتبر" });

    const comment = await Comment.findById(id);

    if (!comment)
      return res
        .status(404)
        .json({ success: false, message: "کامنت یافت نضد" });

    if (
      req.user.id === comment.author.toString() ||
      req.user.role === "admin"
    ) {
      const deletedComment = await Comment.findByIdAndDelete(id);

      await deleteCommentAndChildren(comment._id);

      return res.json({
        success: true,
        message: "کامنت با موفقیت حذف شد",
        data: filterComment(deletedComment.toObject()),
      });
    }

    return res.status(403).json({
      success: false,
      message: "شما دسترسی به حذف این کامنت را ندارید",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "خطا در ارتباط با سرور" });
  }
}

export async function setConfirmComment(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const { status } = req.body;

  try {
    if (typeof status !== "boolean")
      return res.status(400).json({
        success: false,
        message: "مقدار وضعیت نامعتبر وارد شده است",
      });

    if (!objectIdPatternCheck(id))
      return res
        .status(400)
        .json({ success: false, message: "شناسه کامنت نامعتبر" });

    const comment = await Comment.findById(id);

    if (!comment)
      return res
        .status(404)
        .json({ success: false, message: "کامنت یافت نشد" });

    comment.isApproved = status;
    const savedComment = await comment.save();

    return res.json({
      success: true,
      message: "وضعیت کامنت با موفقیت تغییر کرد.",
      data: filterComment(savedComment.toObject()),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "خطا در ارتباط با سرور" });
  }
}
