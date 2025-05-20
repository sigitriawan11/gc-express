#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);
const nameArg = args.find(arg => arg.startsWith('--name='));
const modelArg = args.find(arg => arg.startsWith('--model='));
const dbArg = args.find(arg => arg.startsWith('--instance='));

if (!nameArg) {
  console.error('❌ Please provide --name argument, e.g., --name=Account');
  process.exit(1);
}

const resourceName = nameArg.split('=')[1];
const fileName = resourceName.toLowerCase();

const useModel = !!modelArg || !!dbArg;

if (useModel && (!modelArg || !dbArg)) {
  console.error('❌ If you use --model, you must also provide --instance (and vice versa).');
  process.exit(1);
}

const modelName = modelArg?.split('=')[1];
const dbName = dbArg?.split('=')[1];

const SRC_PATH = path.resolve('src');

const controllerPath = path.join(SRC_PATH, 'controllers', `${fileName}.ts`);
const resourcePath = path.join(SRC_PATH, 'controllers', 'resources', `${fileName}-resource.ts`);
const servicePath = path.join(SRC_PATH, 'services', `${fileName}-service.ts`);
const typesPath = path.join(SRC_PATH, 'types', `${fileName}-types.ts`);

const controllerContent = `import { GCRouter } from "../config/router";
import { ${resourceName}Resource } from "./resources/${fileName}-resource";
${useModel ? `import ${modelName}Model from "../model/${modelName?.toLowerCase()}-model";\n` : ''}
GCRouter.resources([${resourceName}Resource${useModel ? `, ${modelName}Model` : ''}]).register();
`;

const resourceContent = `import { NextFunction, Request, Response } from "express";
import { ${resourceName}Service } from "../../services/${fileName}-service";

export class ${resourceName}Resource {
    static async find(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await ${resourceName}Service.find()
            res.status(200).json({ status: true, message: "Successfully get data", data }) 
        } catch (error) {
            next(error)
        }
    }

    static async findOne(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await ${resourceName}Service.findOne()
            res.status(200).json({ status: true, message: "Successfully get data", data }) 
        } catch (error) {
            next(error)
        }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await ${resourceName}Service.create()
            res.status(200).json({ status: true, message: "Successfully create data", data }) 
        } catch (error) {
            next(error)
        }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await ${resourceName}Service.update()
            res.status(200).json({ status: true, message: "Successfully update data", data }) 
        } catch (error) {
            next(error)
        }
    }

    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await ${resourceName}Service.delete()
            res.status(200).json({ status: true, message: "Successfully delete data", data }) 
        } catch (error) {
            next(error)
        }
    }
}
`;

const serviceContent = `import {
  ${resourceName}RequestCreate,
  ${resourceName}RequestDelete,
  ${resourceName}RequestFind,
  ${resourceName}RequestFindOne,
  ${resourceName}RequestUpdate,
  ${resourceName}ResponseFind,
  ${resourceName}ResponseFindOne,
  ${resourceName}ResponseCreate,
  ${resourceName}ResponseUpdate,
  ${resourceName}ResponseDelete,
} from "../types/${fileName}-types";

export class ${resourceName}Service {
  static async find(param?: ${resourceName}RequestFind): Promise<${resourceName}ResponseFind> {
    return {};
  }

  static async findOne(param?: ${resourceName}RequestFindOne): Promise<${resourceName}ResponseFindOne> {
    return {};
  }

  static async create(param?: ${resourceName}RequestCreate): Promise<${resourceName}ResponseCreate> {
    return {};
  }

  static async update(param?: ${resourceName}RequestUpdate): Promise<${resourceName}ResponseUpdate> {
    return {};
  }

  static async delete(param?: ${resourceName}RequestDelete): Promise<${resourceName}ResponseDelete> {
    return {};
  }
}
`;

const typesContent = `export interface ${resourceName}RequestFind {}

export interface ${resourceName}RequestFindOne {}

export interface ${resourceName}RequestCreate {}

export interface ${resourceName}RequestUpdate {}

export interface ${resourceName}RequestDelete {}

export interface ${resourceName}ResponseFind {}

export interface ${resourceName}ResponseFindOne {}

export interface ${resourceName}ResponseCreate {}

export interface ${resourceName}ResponseUpdate {}

export interface ${resourceName}ResponseDelete {}
`;

const modelContent = `import { GCModel } from '../config/model';
import { ${dbName} } from '../app/database';

interface ${modelName}Attributes {

}

class ${modelName}Model extends GCModel<${modelName}Attributes> {

}

${modelName}Model.init(
  {
  },
  {
    sequelize: ${dbName},
    modelName: '${modelName}',
    schema: 'apps',
    freezeTableName: true,
    tableName: '${modelName?.toLowerCase()}s',
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
  }
);

export { ${modelName}Attributes };
export default ${modelName}Model;
`;

function writeFile(filePath: string, content: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Created: ${filePath}`);
  } else {
    console.log(`⚠️  Skipped (already exists): ${filePath}`);
  }
}

writeFile(controllerPath, controllerContent);
writeFile(resourcePath, resourceContent);
writeFile(servicePath, serviceContent);
writeFile(typesPath, typesContent);

if (useModel && modelName && dbName) {
  const modelPath = path.join(SRC_PATH, 'model', `${modelName.toLowerCase()}-model.ts`);
  writeFile(modelPath, modelContent);
}
