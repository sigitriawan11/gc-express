import fs from "fs";
import path from "path";
import { Application } from "express";
import { GCRouter } from "./router";

import versionsConfig from "./versions.json";

type RegisterOptions = {
  controllersDir?: string;
  basePath?: string;
};

export function registerRoutes(
  app: Application,
  options: RegisterOptions = {}
): void {
  const basePath = options.basePath || "/";
  const controllersDir =
    options.controllersDir || path.join(__dirname, "../controllers");

  loadControllers(controllersDir);
  GCRouter.registerAllRoutes();

  const router = GCRouter.getRouter();

  app.use(basePath, router);

  const versions = versionsConfig.availableVersions;

  cloneRoutesWithFallback(app, router, versions);
  versions.forEach((item) => {
    app.use(`${basePath}${item}`, router)
  })

}


function loadControllers(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      loadControllers(fullPath);
    } else if (stat.isFile() && /\.(js|ts)$/.test(file)) {
      require(fullPath);
    }
  }
}

function cloneRoutesWithFallback(
  app: Application,
  router: any,
  versions: string[]
): void {
  const routeMap = new Map<string, { methods: string[], handlers: any[] }>();

  // Simpan semua rute yang ada terlebih dahulu ke dalam map
  for (const layer of router.stack) {
    if (!layer.route) continue;

    const routePath = layer.route.path;
    const methods = Object.keys(layer.route.methods);
    const handlers = layer.route.stack.map((mw: any) => mw.handle);
    routeMap.set(`${routePath}`, { methods, handlers });
  }

  for (let i = 0; i < versions.length; i++) {
    const currentVersion = versions[i];
    const currentPrefix = `/${currentVersion}`;

    // Semua route yang akan dimiliki versi ini
    const currentRoutes = new Map<string, { methods: string[], handlers: any[] }>();

    // Cek apakah ada rute manual untuk versi ini
    for (const [path, { methods, handlers }] of routeMap.entries()) {
      if (path.startsWith(`${currentPrefix}/`)) {
        currentRoutes.set(path, { methods, handlers });
      }
    }

    // Fallback ke versi sebelumnya jika belum punya rute tertentu
    for (let j = i - 1; j >= 0; j--) {
      const fallbackVersion = versions[j];
      const fallbackPrefix = `/${fallbackVersion}`;

      for (const [path, { methods, handlers }] of routeMap.entries()) {
        if (!path.startsWith(`${fallbackPrefix}/`)) continue;

        const newPath = path.replace(fallbackPrefix, currentPrefix);

        // Jika versi sekarang belum punya path ini, fallback
        if (!currentRoutes.has(newPath)) {
          methods.forEach((method) => {
            (app as any)[method](newPath, ...handlers);
          });
          currentRoutes.set(newPath, { methods, handlers });
        }
      }
    }
  }
}










