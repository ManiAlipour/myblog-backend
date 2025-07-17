import { Router } from "express";
import * as postController from "../controllers/postsController";
import * as commentController from "../controllers/commentsController";
import { authMiddleware } from "../middleware/authMiddleware";
import { adminMiddleware } from "../middleware/adminMiddleware";
import {
  addPostValidator,
  editPostValidator,
} from "../validators/postValidator";
import { canAccessOwnProfile } from "../middleware/canAccessOwnProfile";

const router = Router();

router.get("/", postController.getAllPosts);
router.get("/:id", postController.getOnePost);
router.get("/:id/comments", commentController.getPostComments);

router.use(authMiddleware);

router.post("/:id/comments/add-comment", commentController.addCommentToPost);

router.use(canAccessOwnProfile);
router.delete("/comments/:id", commentController.deleteComment);

router.use(adminMiddleware);

router.put("/comments/accept/:id", commentController.setConfirmComment);
router.post("/", addPostValidator, postController.addNewPost);
router.put("/:id", editPostValidator, postController.editPost);
router.delete("/:id", postController.deletePost);

export default router;
