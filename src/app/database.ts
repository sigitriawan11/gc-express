import { Sequelize, Options } from "sequelize";
import { dbConfig } from "../config/database";

const config:Options = dbConfig

const createInstance = (database:string) : Sequelize => {
  const dbSpecificConfig: Options = {
    ...config,
    database,
  };
  return new Sequelize(dbSpecificConfig)
}

export const usermanagementDB = createInstance('usermanagement')