import { Router } from "express";
import * as postController from "../../controllers/posts/postsController";
import { authMiddleware } from "../../middleware/authMiddleware";
import { adminMiddleware } from "../../middleware/adminMiddleware";
import {
  addPostValidator,
  editPostValidator,
} from "../../validators/postValidator";
import upload from "../../utils/multer";
import validateImageFile from "../../middleware/validateImageFile";

const router = Router();

router.get("/", postController.getAllPosts);
router.get("/:id", postController.getOnePost);

router.use(authMiddleware);
router.use(adminMiddleware);

router.post(
  "/",
  upload.single("coverImage"),
  validateImageFile,
  addPostValidator,
  postController.addNewPost
);
router.put("/:id", editPostValidator, postController.editPost);
router.delete("/:id", postController.deletePost);

export default router;
