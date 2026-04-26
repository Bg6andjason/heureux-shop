import dotenv from "dotenv";

dotenv.config();

const {
  NODE_ENV,
  PORT,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASS,
  DB_NAME,
  CORS_ORIGIN,
  JWT_SECRET,
} = process.env;

export const env = {
  nodeEnv: NODE_ENV || "development",
  port: PORT || "",

  db: {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
  },

  corsOrigin: CORS_ORIGIN,

  /** 用於簽署 JWT，開發可省略（使用預設值） */
  jwtSecret: JWT_SECRET || "heureux-demo-secret",
};
