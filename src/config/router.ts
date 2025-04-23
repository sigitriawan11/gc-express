import express, { RequestHandler, Router } from "express";
import path from "path";
import { MiddlewareRegistry, MiddlewareName } from "../middleware";
import { RoleName } from "../constants/roles";
import { multerMiddleware } from "./multer";

export class GCRouter {
  private static _router: Router = express.Router();

  private path: string;
  private method: "get" | "post" | "put" | "delete";
  private middlewares: RequestHandler[] = [];

  constructor(method: "get" | "post" | "put" | "delete", path: string) {
    this.method = method;
    this.path = path;
  }

  static get(path?: string) {
    const fullPath = getFullPath(path);
    return new GCRouter("get", fullPath);
  }

  static post(path?: string) {
    const fullPath = getFullPath(path);
    return new GCRouter("post", fullPath);
  }

  static put(path?: string) {
    const fullPath = getFullPath(path);
    return new GCRouter("put", fullPath);
  }

  static delete(path?: string) {
    const fullPath = getFullPath(path);
    return new GCRouter("delete", fullPath);
  }

  handler(handler: RequestHandler) {    
    GCRouter._router[this.method](this.path, ...this.middlewares, handler);
    return this;
  }

  middleware(data: MiddlewareName | MiddlewareName[]) {
    const mw = GCRouter.middlewareFactory(data);
    this.middlewares.push(mw);
    return this;
  }

  get upload() {
    return {
      single: (field: string) => {
        this.middlewares.push(multerMiddleware.single(field));
        return this;
      },
      array: (field: string, max?: number) => {
        this.middlewares.push(multerMiddleware.array(field, max));
        return this;
      },
      fields: (fields: { name: string; maxCount: number }[]) => {
        this.middlewares.push(multerMiddleware.fields(fields));
        return this;
      },
      any: () => {
        this.middlewares.push(multerMiddleware.any());
        return this;
      },
    };
  }

  static getRouter() {
    return this._router;
  }

  private static middlewareFactory(data: MiddlewareName | MiddlewareName[]): RequestHandler {
    return async (req, res, next) => {
      try {
        const names = Array.isArray(data) ? data : [data];

        for (const entry of names) {
          let middlewareFn: RequestHandler;

          if (entry.startsWith("roles:")) {
            const role = entry.split(":")[1] as RoleName;
            middlewareFn = MiddlewareRegistry.roles(role);
          } else if (entry === "auth") {
            middlewareFn = MiddlewareRegistry.auth;
          } else {
            throw new Error(`Middleware '${entry}' not recognized`);
          }

          await new Promise<void>((resolve, reject) => {
            middlewareFn(req, res, (err?: any) => (err ? reject(err) : resolve()));
          });
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }
}


// === UTILS ===

function getFullPath(path?: string): string {
  const versionPrefix = process.env.API_VERSION_PREFIX || "";
  const callerPath = getCallerFilePath();
  const fullPath = path ? `${callerPath}/${path}` : callerPath;
  return `${versionPrefix}${fullPath}`;
}

function getCallerFilePath(): string {
  const originalFunc = Error.prepareStackTrace;
  let callerFile: string | undefined;

  try {
    const err = new Error();
    Error.prepareStackTrace = (_, stack) => stack;
    const currentFile = (err.stack as any)[0].getFileName();

    for (let i = 1; i < (err.stack as any).length; i++) {
      callerFile = (err.stack as any)[i].getFileName();
      if (callerFile !== currentFile) break;
    }
  } catch {}

  Error.prepareStackTrace = originalFunc;

  if (!callerFile) throw new Error("Could not determine caller file path.");

  const relativePath = path.relative(path.join(__dirname, "../controllers"), callerFile);
  return "/" + relativePath.replace(/\\/g, "/").replace(/\.ts$/, "");
}
