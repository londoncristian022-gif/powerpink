import { createPool } from "mysql2/promise";

const port = Number(process.env["DB_PORT"] ?? process.env["POWER_PINK_DB_PORT"] ?? "3306");
const user = process.env["DB_USER"] || process.env["POWER_PINK_DB_USER"] || "root";
const password = process.env["DB_PASSWORD"] ?? process.env["POWER_PINK_DB_PASSWORD"] ?? "";

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("DB_PORT debe ser un puerto TCP válido.");
}

if (process.env["NODE_ENV"] === "production" && (!user || !password)) {
  throw new Error("Debes configurar DB_USER y DB_PASSWORD en producción.");
}

export const dbPool = createPool({
  host: process.env["DB_HOST"] || process.env["POWER_PINK_DB_HOST"] || "localhost",
  user,
  password,
  database: process.env["DB_NAME"] || process.env["POWER_PINK_DB_NAME"] || "power_pink",
  port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
});
