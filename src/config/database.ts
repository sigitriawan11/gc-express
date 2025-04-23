import 'dotenv/config';
import { Options } from "sequelize";
interface DatabaseConfig extends Options {
    user: string;
}

const dbConfig: DatabaseConfig = {
    user: process.env[`DB_USER_${[process.env.NODE_ENV]}`] ?? "postgres",
    username: process.env[`DB_USER_${[process.env.NODE_ENV]}`] ?? "postgres",
    password: process.env[`DB_PWD_${[process.env.NODE_ENV]}`] ?? "",
    host: process.env[`DB_HOST_${[process.env.NODE_ENV]}`] ?? "127.0.0.1",
    dialect: 'postgres',
    dialectOptions: {
        connectTimeout: 60000,
        useUTC: true, // for reading from database
    },
    port: Number(process.env[`DB_PORT_${[process.env.NODE_ENV]}`]) ?? 5432,
    timezone: '+07:00',

};

export { dbConfig };

