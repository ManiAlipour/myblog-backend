import { Router } from "express";
import { home } from "../controllers/indexController";
import userRouter from "./user";
import postsRouter from "./posts";
import MetaRouter from "./metaRouter";

const router = Router();

router.get("/", home);
router.use("/users", userRouter);
router.use("/posts", postsRouter);
router.use("/meta", MetaRouter);

export default router;
