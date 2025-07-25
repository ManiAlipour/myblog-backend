import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import * as contactUsController from "../../controllers/contact-us/contactUsController";
import { messageValidation } from "../../validators/contactUsValidator";

const router = Router();

router.use(authMiddleware);
router.post("/", messageValidation, contactUsController.sendMessage);

export default router;
