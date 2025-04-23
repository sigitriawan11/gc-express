import { RoleMiddleware } from "../config/roles";
import { RoleName } from "../constants/roles";
import { authMiddleware } from "./auth-middleware";
import { roleMiddleware } from "./role-middleware";

export const MiddlewareRegistry = {
  auth: authMiddleware,
  roles: (param: RoleName) => roleMiddleware(param as string),
} as const;

export type MiddlewareName = 'auth' | RoleMiddleware;
