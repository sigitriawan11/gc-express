import { RoleMiddleware } from "../config/roles";
import { RoleName } from "../constants/roles";
import { authMiddleware } from "./auth-middleware";
import { guestMiddleware } from "./guest-middleware";
import { roleMiddleware } from "./role-middleware";

export const MiddlewareRegistry = {
  auth: authMiddleware,
  guest: guestMiddleware,
  roles: (param: RoleName) => roleMiddleware(param as string),
} as const;

export type MiddlewareName = 'auth' | 'guest' | RoleMiddleware;
