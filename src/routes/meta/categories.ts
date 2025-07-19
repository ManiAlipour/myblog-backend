import { Router } from "express";
import * as categoriesController from "../../controllers/meta/categoriesController";
import { authMiddleware } from "../../middleware/authMiddleware";
import { adminMiddleware } from "../../middleware/adminMiddleware";
import {
  addCategoryValidator,
  editCategoryValidator,
} from "../../validators/categoryValidator";

const router = Router();

router.get("/", categoriesController.getAllCategories);
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  addCategoryValidator,
  categoriesController.addNewCategory
);
router.get("/:id", categoriesController.getOneCategory);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  editCategoryValidator,
  categoriesController.editCategory
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  categoriesController.deleteCategory
);
router.get("/categories-posts", categoriesController.getPostWithCategory);

export default router;
