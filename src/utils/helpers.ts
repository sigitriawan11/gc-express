import path from 'path';
export class Helpers {
    static getCallerFilePath(): string {
      const origPrepareStackTrace = Error.prepareStackTrace;
      Error.prepareStackTrace = (_, stack) => stack;
  
      const err = new Error();
      const stack = err.stack as unknown as NodeJS.CallSite[];
  
      Error.prepareStackTrace = origPrepareStackTrace;
  
      for (const site of stack) {
        const fileName = site.getFileName();
        if (
          fileName &&
          !fileName.includes("node_modules") &&
          !fileName.includes("router") &&
          !fileName.includes("utils")
        ) {
          return fileName;
        }
      }
  
      return "";
    }
  
    static getFullPath(pathOverride?: string): string {
      pathOverride = pathOverride ? `/${pathOverride}` : ""
      const callerFile = this.getCallerFilePath();
      const controllersPath = path.join(__dirname, "../controllers");
      const relativePath = path.relative(controllersPath, callerFile);
      const cleanedPath = relativePath.replace(/\\/g, "/").replace(/\.ts$/, "");
        
      return "/" + cleanedPath + pathOverride;
    }
  }
  