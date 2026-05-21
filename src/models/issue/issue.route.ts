import { Router } from "express";
import { issueController } from "./issue.controller";
import auth from "../../middlewere/auth";

const router = Router();

router.post("/", auth(), issueController.createUssues);

export const issueRouter = router;
