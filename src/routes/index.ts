import { Router } from "express";
import { home } from "../controllers/indexController";
import userRouter from "./user";

const router = Router();

router.get("/", home);
router.use("/users", userRouter);

export default router;
