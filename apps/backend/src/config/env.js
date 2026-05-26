import dotenv from "dotenv";

dotenv.config();

const {
  NODE_ENV,
  PORT,
  DATABASE_URL,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASS,
  DB_NAME,
  DB_SSL,
  CORS_ORIGIN,
  JWT_SECRET,
} = process.env;

const corsOrigin = CORS_ORIGIN
  ? CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
  : undefined;

export const env = {
  nodeEnv: NODE_ENV || "development",
  port: Number(PORT) || 3001,

  db: {
    url: DATABASE_URL,
    host: DB_HOST,
    port: Number(DB_PORT) || 5432,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    ssl: DB_SSL !== "false",
  },

  corsOrigin,

  /** 用於簽署 JWT，開發可省略（使用預設值） */
  jwtSecret: JWT_SECRET || "heureux-demo-secret",
};
