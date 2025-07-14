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

type ModelBindingMethods = "findOne" | "update" | "delete";

type MulterMethod = "create" | "update";
type MulterType = "single" | "array" | "any" | "fields";
type MulterOptionsForType<T extends MulterType> = T extends "fields"
  ? Array<{ name: string; maxCount: number }>
  : T extends "array"
  ? { name: string; maxCount?: number }
  : any;

type MulterConfig =
  | boolean
  | {
      [K in MulterType]?:
        | MulterMethod
        | MulterMethod[]
        | Partial<Record<MulterMethod, MulterOptionsForType<K>>>;
    };

type ResourceConfig = {
  find?: boolean;
  findOne?: boolean;
  create?: boolean;
  update?: boolean;
  delete?: boolean;
  multer?: MulterConfig;
  keyModelBinding?: string | Partial<Record<ModelBindingMethods, string>>;
};

function normalizeMulter(
  config: MulterConfig
): Map<"create" | "update", { type: MulterType; options?: any }> {
  const map = new Map<
    "create" | "update",
    { type: MulterType; options?: any }
  >();

  if (config === true) {
    map.set("create", { type: "single" });
    map.set("update", { type: "single" });
    return map;
  }

  if (typeof config !== "object" || config === null) {
    return map;
  }

  for (const type of ["single", "array", "any", "fields"] as MulterType[]) {
    const val = config[type as keyof typeof config];

    if (!val) continue;

    if (typeof val === "string") {
      map.set(val as MulterMethod, { type });
    } else if (Array.isArray(val)) {
      val.forEach((method) => map.set(method as MulterMethod, { type }));
    } else if (typeof val === "object") {
      for (const method of Object.keys(val) as MulterMethod[]) {
        map.set(method, { type, options: val[method] });
      }
    }
  }

  return map;
}

function resolveParam(
  method: "findOne" | "update" | "delete",
  bindModel?: GCModelStatic<GCModel<any>>,
  keyModelBinding?:
    | string
    | Partial<Record<"findOne" | "update" | "delete", string>>
): string {
  if (!bindModel) return "";

  const defaultKey = bindModel.primaryKeyAttribute || "id";

  if (!keyModelBinding) return `:${defaultKey}`;

  if (typeof keyModelBinding === "string") {
    return `:${keyModelBinding}`;
  }

  return `:${keyModelBinding[method] ?? defaultKey}`;
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
    controller:
      | ResourceController
      | [ResourceController, GCModelStatic<GCModel<any>>],
    config?: ResourceConfig
  ) {
    const routes: {
      route: GCRouter;
      handler: RequestHandler;
    }[] = [];

    const { multer, ...cleanConfig } = config || {};

    const finalConfig: Record<keyof ResourceController, boolean> = {
      find: true,
      findOne: true,
      create: true,
      update: true,
      delete: true,
      ...cleanConfig,
    };

    let c;
    let bindModel: GCModelStatic<GCModel<any>>;

    if (Array.isArray(controller)) {
      c = controller[0];
      bindModel = controller[1];
    } else {
      c = controller;
    }

    const [typeParam, valueParam] = [
      typeof config?.keyModelBinding,
      config?.keyModelBinding,
    ];

    const multerMap = normalizeMulter(config?.multer!);

    if (c?.find && finalConfig.find) {
      routes.push({ route: this.get(), handler: c?.find });
    }
    if (c?.findOne && finalConfig.findOne) {
      const route = this.get(resolveParam("findOne", bindModel!, valueParam));
      routes.push({
        route: route,
        handler: c?.findOne,
      });
    }
    if (c?.create && finalConfig.create) {
      const route = this.post();

      if (multerMap.get("create")) {
        route.upload[multerMap.get("create")?.type!](
          multerMap.get("create")?.options
        );
      }

      routes.push({ route, handler: c?.create });
    }
    if (c?.update && finalConfig.update) {
      const route = this.put(resolveParam("update", bindModel!, valueParam));

      if (multerMap.get("update")) {
        route.upload[multerMap.get("update")?.type!](
          multerMap.get("update")?.options
        );
      }
      routes.push({ route: route, handler: c?.update });
    }
    if (c?.delete && finalConfig.delete) {
      routes.push({
        route: this.delete(resolveParam("delete", bindModel!, valueParam)),
        handler: c?.delete,
      });
    }

    return {
      middleware(data: MiddlewareName | MiddlewareName[]) {
        routes.forEach(({ route }) => route.middleware(data));
        return this;
      },
      register() {
        routes.forEach(({ route, handler }) => {
          if (route.path.includes(':') && bindModel) {
            route.middlewares.push(modelBindingMiddleware(bindModel));
          }

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
          } else if (entry === "guest") {
            middlewareFn = MiddlewareRegistry.guest;
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
