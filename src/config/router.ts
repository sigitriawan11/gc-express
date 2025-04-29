import express, { RequestHandler, Router } from "express";
import { MiddlewareRegistry, MiddlewareName } from "../middleware";
import { RoleName } from "../constants/roles";
import { multerMiddleware } from "./multer";
import { Utils } from '../utils/utils';
import { GCModel, GCModelStatic } from "./model";
import { modelBindingMiddleware } from "../middleware/model-binding-middleware";

export class GCRouter {
  private static _router: Router = express.Router();
  private static _groupMiddlewares: RequestHandler[] = [];

  private path: string;
  private method: "get" | "post" | "put" | "delete";
  public model?: GCModelStatic<GCModel<any>>
  private middlewares: RequestHandler[] = [];

  constructor(method: "get" | "post" | "put" | "delete", path: string, model?: GCModelStatic<GCModel<any>> ) {
    this.method = method;
    this.path = path;
    this.model = model
  }


  static get(path?: string, model?: GCModelStatic<GCModel<any>>) {
    const fullPath = Utils.getFullPath(path);
    return new GCRouter("get", fullPath, model);
  }

  static post(path?: string) {
    const fullPath = Utils.getFullPath(path);
    return new GCRouter("post", fullPath);
  }

  static put(path?: string, model?: GCModelStatic<GCModel<any>>) {
    const fullPath = Utils.getFullPath(path);
    return new GCRouter("put", fullPath, model);
  }

  static delete(path?: string, model?: GCModelStatic<GCModel<any>>) {
    const fullPath = Utils.getFullPath(path);
    return new GCRouter("delete", fullPath, model);
  }

  static Group() {
    return new this.GroupRouter();
  }
  
  private static GroupRouter = class {
    private groupMiddlewares: RequestHandler[] = [];
  
    middleware(data: MiddlewareName | MiddlewareName[]) {
      const mw = GCRouter.middlewareFactory(data);
      this.groupMiddlewares.push(mw);
      return this;
    }
  
    use(callback: (router: typeof GCRouter) => void) {
      const originalRouterMethod = GCRouter.prototype.handler;
  
      GCRouter.prototype.handler = function (this: GCRouter, handler: RequestHandler) {
        this.middlewares = [
          ...((this.constructor as typeof GCRouter)._groupMiddlewares || []),
          ...(this.middlewares || []),
        ];
        return originalRouterMethod.call(this, handler);
      };
  
      (GCRouter as any)._groupMiddlewares = this.groupMiddlewares;
  
      callback(GCRouter);
  
      delete (GCRouter as any)._groupMiddlewares;
      GCRouter.prototype.handler = originalRouterMethod;
    };
  };
  

  handler(handler: RequestHandler) {
    
    if(this.model){
      this.middlewares.push(modelBindingMiddleware(this.model))
    }

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
