import { Router } from "express";
import * as controller from "../../controllers/auth/userController";
import * as validators from "../../validators/userValidator";
import { authMiddleware } from "../../middleware/authMiddleware";
import { canAccessOwnProfile } from "../../middleware/canAccessOwnProfile";
import upload from "../../utils/multer";
import validateImageFile from "../../middleware/validateImageFile";

const router = Router();

router.use(authMiddleware);
router.use(canAccessOwnProfile);
router.get("/profile", controller.getProfile);
router.put("/profile", validators.editProfileValidator, controller.editProfile);
router.put(
  "/avatar",
  upload.single("avatar"),
  validateImageFile,
  controller.setUserAvatar
);

export default router;
