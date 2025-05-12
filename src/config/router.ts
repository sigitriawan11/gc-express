import express, { RequestHandler, Router } from "express";
import { MiddlewareRegistry, MiddlewareName } from "../middleware";
import { RoleName } from "../constants/roles";
import { multerMiddleware } from "./multer";
import { Utils } from "../utils/utils";
import { GCModel, GCModelStatic } from "./model";
import { modelBindingMiddleware } from "../middleware/model-binding-middleware";

interface ResourceController {
  find?: RequestHandler;
  findOne?: RequestHandler;
  create?: RequestHandler;
  update?: RequestHandler;
  delete?: RequestHandler;
}

export class GCRouter {
  public static _routesToRegister: {
    method: "get" | "post" | "put" | "delete";
    path: string;
    handler: RequestHandler;
    middlewares: RequestHandler[];
  }[] = [];
  private static _router: Router = express.Router();
  private static _groupMiddlewares: RequestHandler[] = [];

  private path: string;
  private method: "get" | "post" | "put" | "delete";
  public model?: GCModelStatic<GCModel<any>>;
  private middlewares: RequestHandler[] = [];

  constructor(
    method: "get" | "post" | "put" | "delete",
    path: string,
    model?: GCModelStatic<GCModel<any>>
  ) {
    this.method = method;
    this.path = path;
    this.model = model;
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

      GCRouter.prototype.handler = function (
        this: GCRouter,
        handler: RequestHandler
      ) {
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
    }
  };

  static resources(
    controller: ResourceController,
    config?: Partial<Record<keyof ResourceController, boolean>>
  ) {
    const routes: {
      route: GCRouter;
      handler: RequestHandler;
    }[] = [];

    const finalConfig: Record<keyof ResourceController, boolean> = {
      find: true,
      findOne: true,
      create: true,
      update: true,
      delete: true,
      ...config,
    };

    if (controller.find && finalConfig.find) {
      routes.push({ route: this.get(), handler: controller.find });
    }
    if (controller.findOne && finalConfig.findOne) {
      routes.push({ route: this.get(":id"), handler: controller.findOne });
    }
    if (controller.create && finalConfig.create) {
      routes.push({ route: this.post(), handler: controller.create });
    }
    if (controller.update && finalConfig.update) {
      routes.push({ route: this.put(":id"), handler: controller.update });
    }
    if (controller.delete && finalConfig.delete) {
      routes.push({ route: this.delete(":id"), handler: controller.delete });
    }

    return {
      middleware(data: MiddlewareName | MiddlewareName[]) {
        routes.forEach(({ route }) => route.middleware(data));
        return this;
      },
      register() {
        routes.forEach(({ route, handler }) => {
          route.handler(handler);
        });
      },
    };
  }

  static registerAllRoutes() {
    for (const route of this._routesToRegister) {
      this._router[route.method](
        route.path,
        ...route.middlewares,
        route.handler
      );
    }
  }

  handler(handler: RequestHandler) {
    const mws = [...this.middlewares];

    if (this.model) {
      mws.push(modelBindingMiddleware(this.model));
    }

    GCRouter._routesToRegister.push({
      method: this.method,
      path: this.path,
      middlewares: mws,
      handler,
    });

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

  private static middlewareFactory(
    data: MiddlewareName | MiddlewareName[]
  ): RequestHandler {
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
            middlewareFn(req, res, (err?: any) =>
              err ? reject(err) : resolve()
            );
          });
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }
}
