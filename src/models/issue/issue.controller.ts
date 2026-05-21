import { type Request, type Response } from "express";
import sendResponse from "../../utility/sendResponse";
import { issueServices } from "./issue.service";

const createUssues = async (req: Request, res: Response) => {
  try {
    const result = await issueServices.createIssuesInDB(req.body, req.user?.id);
    console.log("result is", result.rows[0]);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message || error.message,
    });
  }
};

export const issueController = {
  createUssues,
};
