import pg from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;

function toPostgresParams(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

function toMysqlLikeResult(result) {
  const rows = result.rows;
  rows.affectedRows = result.rowCount;
  if (rows[0]?.id) {
    rows.insertId = rows[0].id;
  }
  return [rows];
}

function createClientWrapper(client) {
  return {
    query: async (sql, params = []) => {
      const result = await client.query(toPostgresParams(sql), params);
      return toMysqlLikeResult(result);
    },
    beginTransaction: () => client.query("BEGIN"),
    commit: () => client.query("COMMIT"),
    rollback: () => client.query("ROLLBACK"),
    release: () => client.release(),
  };
}

const pool = new Pool({
  connectionString: env.db.url,
  host: env.db.url ? undefined : env.db.host,
  port: env.db.url ? undefined : env.db.port,
  user: env.db.url ? undefined : env.db.user,
  password: env.db.url ? undefined : env.db.password,
  database: env.db.url ? undefined : env.db.database,
  ssl: env.db.ssl ? { rejectUnauthorized: false } : undefined,
  max: 5,
});

export default {
  query: async (sql, params = []) => {
    const result = await pool.query(toPostgresParams(sql), params);
    return toMysqlLikeResult(result);
  },
  getConnection: async () => createClientWrapper(await pool.connect()),
};
