import type { Request, Response } from "express";
import { authServices } from "./auth.service";
import sendResponse from "../../utility/sendResponse";

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await authServices.createUserIntoDB(req.body);

    delete result.rows[0].password;

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Sign Up Failed",
      error: error,
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await authServices.loginUserIntoDB(req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Login Successfull",
      data: {
        token: result.token,
        user: result.user,
      },
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 401,
      success: false,
      message: error.message || error.message,
    });
  }
};

export const authController = {
  createUser,
  loginUser,
};
