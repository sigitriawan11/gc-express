import { RequestHandler } from "express";
import { ErrForbidden } from '../error/errors';
import { roles } from "../constants/roles";

export const roleMiddleware = (param: string): RequestHandler => {
  const allowedRole = param
    .split("|")
    .map((r) => r.trim())
    .map((roleName) => roles[roleName])
    .filter((value) => value !== undefined);

  const middleware: RequestHandler = (req, res, next) => {
    if(!req.body?.jwtTokenPayload){
      throw new ErrForbidden();
    }

    const id_role = req.body.jwtTokenPayload?.id_role;

    if (!allowedRole.includes(id_role)) {
      throw new ErrForbidden();
    }

    next();
  };

  return middleware;
};
