import { Router } from "express";
import * as metaController from "../controllers/metaController";
import { authMiddleware } from "../middleware/authMiddleware";
import { adminMiddleware } from "../middleware/adminMiddleware";
import {
  addCategoryValidator,
  editCategoryValidator,
} from "../validators/categoryValidator";
import { addTagValidator, editTagValidator } from "../validators/tagValidator";

const router = Router();

// Category routes
router.get("/categories", metaController.getAllCategories);
router.post(
  "/categories",
  authMiddleware,
  adminMiddleware,
  addCategoryValidator,
  metaController.addNewCategory
);
router.get("/categories/:id", metaController.getOneCategory);
router.put(
  "/categories/:id",
  authMiddleware,
  adminMiddleware,
  editCategoryValidator,
  metaController.editCategory
);
router.delete(
  "/categories/:id",
  authMiddleware,
  adminMiddleware,
  metaController.deleteCategory
);
router.get("/categories-posts", metaController.getPostWithCategory);

// Tag routes
router.get("/tags", metaController.getAllTags);
router.post(
  "/tags",
  authMiddleware,
  adminMiddleware,
  addTagValidator,
  metaController.addNewTag
);
router.get("/tags/:id", metaController.getOneTag);
router.put(
  "/tags/:id",
  authMiddleware,
  adminMiddleware,
  editTagValidator,
  metaController.editTag
);
router.delete(
  "/tags/:id",
  authMiddleware,
  adminMiddleware,
  metaController.deleteTag
);

export default router;
