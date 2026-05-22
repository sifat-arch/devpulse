import { type Request, type Response } from "express";
import sendResponse from "../../utility/sendResponse";
import { issueServices } from "./issue.service";
import type { AuthUser, User } from "../../types/types";

const createUssues = async (req: Request, res: Response) => {
  try {
    const result = await issueServices.createIssuesInDB(req.body, req.user?.id);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0],
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    });
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const query = req.query;

    const result = await issueServices.getAllIssuesFromDB(query);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue created successfully",
      data: result,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    });
  }
};

const getSingleIssues = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await issueServices.getSingleIssueFromDB(id as string);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Success!!",
      data: result,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    });
  }
};

const updateIssues = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = req.user;

    const result = await issueServices.updateIssueFromDB(
      user as User,
      req.body,
      id as string,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result.rows[0],
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    });
  }
};

const deleteIssues = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const result = await issueServices.deleteIssueFromDB(
      id as string,
      user as User,
    );

    if (result.rowCount === 0) {
      sendResponse(res, {
        statusCode: 404,
        success: true,
        message: "User not Found",
      });
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "message deleted successfully",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    });
  }
};

export const issueController = {
  createUssues,
  getAllIssues,
  getSingleIssues,
  updateIssues,
  deleteIssues,
};
