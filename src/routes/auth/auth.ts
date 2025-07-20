import { Router } from "express";
import * as validators from "../../validators/userValidator";
import * as authController from "../../controllers/auth/authController";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();

router.post(
  "/register",
  validators.registerValidator,
  authController.addNewUser
);
router.post("/verify-email", authController.verifyEmail);
router.post("/login", validators.loginValidator, authController.login);

router.use(authMiddleware);
router.post("/logout", authController.logout);

export default router;
