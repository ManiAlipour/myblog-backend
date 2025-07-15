import { Router } from "express";
import { home } from "../controllers/indexController";
import userRouter from "./user";
import postsRouter from "./posts";

const router = Router();

router.get("/", home);
router.use("/users", userRouter);
router.use("/posts", postsRouter);

export default router;
