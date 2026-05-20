import type { Request, Response } from "express";
import { authServices } from "./auth.service";

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await authServices.createUserIntoDB(req.body);
  } catch (error) {}
};

export const authController = {
  createUser,
};
