import { Router } from "express";
import * as TagsController from "../../controllers/meta/tagsController";
import { authMiddleware } from "../../middleware/authMiddleware";
import { addTagValidator, editTagValidator } from "../../validators/tagValidator";
import { adminMiddleware } from "../../middleware/adminMiddleware";


const router = Router();

router.get("/", TagsController.getAllTags);
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  addTagValidator,
  TagsController.addNewTag
);
router.get("/:id", TagsController.getOneTag);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  editTagValidator,
  TagsController.editTag
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  TagsController.deleteTag
);

export default router;
