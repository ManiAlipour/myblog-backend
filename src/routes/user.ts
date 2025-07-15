import { Router } from "express";
import * as controller from "../controllers/userController";
import {
  editProfileValidator,
  loginValidator,
  registerValidator,
} from "../validators/userValidator";
import { authMiddleware } from "../middleware/authMiddleware";
import { canAccessOwnProfile } from "../middleware/canAccessOwnProfile";
import { adminMiddleware } from "../middleware/adminMiddleware";

const router = Router();

router.post("/register", registerValidator, controller.addNewUser);
router.post("/verify-email", controller.verifyEmail);
router.post("/login", loginValidator, controller.login);

router.use(authMiddleware);
router.use(canAccessOwnProfile);
router.get("/profile", controller.getProfile);
router.put("/profile", editProfileValidator, controller.editProfile);

router.use(adminMiddleware);
router.get("/all-users", controller.getAllUsers);

export default router;
