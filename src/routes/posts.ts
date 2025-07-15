import { Router } from "express";
import * as PostsController from "../controllers/postsController";
import { authMiddleware } from "../middleware/authMiddleware";
import { adminMiddleware } from "../middleware/adminMiddleware";

const router = Router();

router.get("/", PostsController.getAllPosts);
router.get("/:id", PostsController.getOnePost);

router.use(authMiddleware);
router.use(adminMiddleware);
router.post("/", PostsController.addNewPost);
router.put("/:id", PostsController.editPost);
router.delete("/:id", PostsController.deletePost);

export default router;
