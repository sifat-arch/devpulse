import { Router } from "express";
import { issueController } from "./issue.controller";
import auth from "../../middlewere/auth";
import { canUpdateIssue } from "../../middlewere/canUpdateIssue";

const router = Router();

router.post("/", auth(), issueController.createUssues);
router.get("/", issueController.getAllIssues);
router.get("/:id", issueController.getSingleIssues);
router.patch("/:id", auth(), issueController.updateIssues);

export const issueRouter = router;
