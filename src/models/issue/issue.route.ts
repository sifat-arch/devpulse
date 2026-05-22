import { Router } from "express";
import { issueController } from "./issue.controller";
import auth from "../../middlewere/auth";

const router = Router();

router.post("/", auth(), issueController.createUssues);
router.get("/", issueController.getAllIssues);
router.get("/:id", issueController.getSingleIssues);
router.patch("/:id", auth(), issueController.updateIssues);
router.delete("/:id", auth(), issueController.deleteIssues);

export const issueRouter = router;
