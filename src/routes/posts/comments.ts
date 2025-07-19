import { Router } from "express";
import * as commentController from "../../controllers/posts/commentsController";
import { authMiddleware } from "../../middleware/authMiddleware";
import { adminMiddleware } from "../../middleware/adminMiddleware";
import { canAccessOwnProfile } from "../../middleware/canAccessOwnProfile";

const router = Router();

router.get("/:id", commentController.getPostComments);

router.use(authMiddleware);
router.post("/:id", commentController.addCommentToPost);
router.delete("/:id", canAccessOwnProfile, commentController.deleteComment);

router.use(adminMiddleware);
router.put("/accept/:id", commentController.setConfirmComment);

export default router;
