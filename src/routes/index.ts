import { Router } from "express";
import { home } from "../controllers/indexController";
import userRouter from "./auth/user";
import postsRouter from "./posts/posts";
import categoriesRouter from "./meta/categories";
import commentsRouter from "./posts/comments";
import tagsRouter from "./meta/tags";
import authRouter from "./auth/auth";
import analyticsRouter from "./analytics";

const router = Router();

router.get("/", home);
router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/posts", postsRouter);
router.use("/comments", commentsRouter);
router.use("/categories", categoriesRouter);
router.use("/tags", tagsRouter);
router.use("/analytics", analyticsRouter);

export default router;
