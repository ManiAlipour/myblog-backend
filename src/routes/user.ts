import { Router } from "express";
import { addNewUser, verifyEmail } from "../controllers/userController";
import { registerValidator } from "../validators/userValidator";

const router = Router();

router.post("/new-user", registerValidator, addNewUser);
router.post("/verify-email", verifyEmail);

export default router;
