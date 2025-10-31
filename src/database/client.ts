import { drizzle } from "drizzle-orm/node-postgres";
import { readFileSync } from "node:fs";
import pg from "pg";
import { dbConfig } from "../config/appConfig.js";
import * as schema from "../database/schemas/index.js";





const pool = new pg.Pool({
  host: dbConfig.DB_HOST,
  port: dbConfig.DB_PORT,
  user: dbConfig.DB_USER,
  password: dbConfig.DB_PASSWORD,
  database: dbConfig.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
    ca: readFileSync(`${process.cwd()}/ca.pem`).toString(),
  },
});
pool.query("select 2+4").then(() => {
  // eslint-disable-next-line no-console
  console.log("db connected");
}).catch(() => {
  console.error("Db connection failed");
});

const db = drizzle(pool, { schema });

export default db;
