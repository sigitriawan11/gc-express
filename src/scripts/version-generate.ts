import fs from "fs";
import path from "path";

interface VersionsConfig {
  availableVersions: string[];
}

function readConfig(configPath: string): VersionsConfig {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }
  const raw = fs.readFileSync(configPath, "utf-8");
  return JSON.parse(raw) as VersionsConfig;
}

function writeConfig(configPath: string, config: VersionsConfig): void {
  const data = JSON.stringify(config, null, 2);
  fs.writeFileSync(configPath, data, "utf-8");
}

function main() {
  const [newVer, fromVer] = process.argv.slice(2);
  if (!newVer) {
    console.error("Usage: npm run generate:version <newVersion> [<fromVersion>]");
    process.exit(1);
  }

  const configPath = path.resolve(__dirname, "../config/versions.json");
  let config: VersionsConfig;

  try {
    config = readConfig(configPath);
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }

  if (config.availableVersions.includes(newVer)) {
    console.error(`Version '${newVer}' already exists.`);
    process.exit(1);
  }

  const baseVer = fromVer || config.availableVersions[config.availableVersions.length - 1];
  if (fromVer && !config.availableVersions.includes(fromVer)) {
    console.error(`Base version '${fromVer}' not found.`);
    process.exit(1);
  }

  config.availableVersions.push(newVer);
  writeConfig(configPath, config);

  console.log(`✅ Added version '${newVer}'${fromVer ? ` based on '${fromVer}'` : ''}`);
}

main();
