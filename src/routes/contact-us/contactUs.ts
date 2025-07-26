import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import * as contactUsController from "../../controllers/contact-us/contactUsController";
import { messageValidation } from "../../validators/contactUsValidator";
import { adminMiddleware } from "../../middleware/adminMiddleware";

const router = Router();

router.get("/", contactUsController.getMessages);
router.use(authMiddleware);
router.post("/", messageValidation, contactUsController.sendMessage);

router.use(adminMiddleware);
router.put("/", contactUsController.setShowInSatisfactions);
router.put("/allow", contactUsController.allowMessage);

export default router;
