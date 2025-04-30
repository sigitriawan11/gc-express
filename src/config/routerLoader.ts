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

  app.use(basePath, GCRouter.getRouter());

  for (const ver of versionsConfig.availableVersions) {
    app.use(`${basePath}${ver}`, GCRouter.getRouter());
  }
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
