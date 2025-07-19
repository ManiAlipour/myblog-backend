import { Router } from "express";
import * as validators from "../../validators/userValidator";
import * as authController from "../../controllers/auth/authController";

const router = Router();

router.post(
  "/register",
  validators.registerValidator,
  authController.addNewUser
);
router.post("/verify-email", authController.verifyEmail);
router.post("/login", validators.loginValidator, authController.login);

export default router;
