/* eslint-disable node/no-process-env */
import { defineConfig } from "drizzle-kit";
import fs from "node:fs";

export default defineConfig({
  dialect: "postgresql",
  schema: "./dist/src/database/schemas/*",
  out: "./drizzle",
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT!),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    ssl: {
      rejectUnauthorized: false,
      ca: fs.readFileSync(`${process.cwd()}/ca.pem`).toString(),
    },

  },
});
