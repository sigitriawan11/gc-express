import { Request, Response, NextFunction } from "express";
import { BaseError } from "../error/errors";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";
import { RC } from "../config/rc";
import { MSG } from "../config/message";
import { consoleLogger } from "../app/logging";

export const errorMiddleware = async (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof ZodError) {
    consoleLogger.info({
      message: error.message
    })
    res.status(RC.BAD_REQUEST).json({
      status: false,
      message: MSG.ERR_VALIDATION,
      data: error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
    return
  } 
  else if (error instanceof BaseError) {
    consoleLogger.info({
      message: error.message
    })
    res.status(error.statusCode).json({
      status: false,
      message: error.message,
    });
    return
  }

  consoleLogger.info({
    message: error.message,
  })

  res.status(RC.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: MSG.ERR_INTERNAL_SERVER_ERROR,
  });
};
