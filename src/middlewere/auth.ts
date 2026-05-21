import type { NextFunction, Request, Response } from "express";
import sendResponse from "../utility/sendResponse";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";

const auth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenStr = req.headers.authorization;

      if (!tokenStr) {
        sendResponse(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized access!!",
        });
      }

      const decodeed = jwt.verify(
        tokenStr as string,
        config.secret as string,
      ) as JwtPayload;

      const userData = await pool.query(
        `
        SELECT * from users WHERE id=$1
      
      `,
        [decodeed.id],
      );

      const user = userData.rows[0];

      if (userData.rows[0] === 0) {
        sendResponse(res, {
          statusCode: 404,
          success: false,
          message: "User not found!!",
        });
      }

      if (user.role !== "contributor" && user.role !== "maintainer") {
        sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "unauthorized access!!",
        });
      }

      req.user = user;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
