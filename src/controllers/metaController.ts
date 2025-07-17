import { Request, Response } from "express";
import Category from "../models/Category";
import { AuthRequest } from "../middleware/authMiddleware";
import { useValidationResult } from "../utils/authfunctionalities";
import messages from "../utils/constants/messages";

export async function getAllCategories(req: Request, res: Response) {
  try {
    const categories = await Category.find({});
    res.json({
      success: true,
      message: messages.SUCCESS,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: messages.ERROR_FETCHING_CATEGORIES,
    });
  }
}

export async function addNewCategory(req: AuthRequest, res: Response) {
  if (useValidationResult({ req, res })) return;

  const { name, slug, description } = req.body;
}
