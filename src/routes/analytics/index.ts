import { Router } from "express";
import pageViewRouter from "./pageView";

const router = Router();

router.use("/page-view", pageViewRouter);

export default router;
