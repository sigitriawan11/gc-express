import { Request, Response, NextFunction } from "express";
import { ErrBadRequest, ErrUnauthorized } from "../error/errors";
import { GCAuth } from "../config/auth";
import { JWTPayloadType } from "../types/gc-types/auth-types";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.headers.authorization) {
      throw new ErrUnauthorized();
    }
    
    let token = req.headers.authorization!;
    if (!token.includes("Bearer")) {
      throw new ErrBadRequest("Invalid Token");
    }
    token = token.replace(/Bearer /g, "");

    const auth = await GCAuth.validate(token, true)

    req.jwt_payload = auth as JWTPayloadType
    req.jwt_token = token;
    return next();
  } catch (error) {
    next(error);
  }
};
