import { Request, Response, NextFunction } from "express";
import { ErrBadRequest, ErrForbidden, ErrUnauthorized } from "../error/errors";
import { GCAuth } from "../config/auth";

export const guestMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.headers.authorization) {
      throw new ErrForbidden();
    }

    return next();
  } catch (error) {
    next(error);
  }
};
