import { Router } from "express";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../../middleware/authMiddleware";
import * as pageViewController from "../../controllers/analytics/pageViewController";
import { adminMiddleware } from "../../middleware/adminMiddleware";

const router = Router();

router.post("/", optionalAuthMiddleware, pageViewController.setPageView);

router.use(authMiddleware);
router.use(adminMiddleware);
router.get("/", pageViewController.getALLPageViewsCount);

export default router;
