import { Router } from "express";
import { home } from "../controllers/indexController";

const router = Router();

router.get("/", home);

export default router;
