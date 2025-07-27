import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { adminMiddleware } from "../../middleware/adminMiddleware";
import * as controller from "../../controllers/auth/adminController";

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/users", controller.getAllUsers);
router.get("/posts", controller.getAllPostsAdmin);
router.get("/comments", controller.getAllCommentsAdmin);
router.get("/dashboard", controller.getDashboardInfo);

export default router;