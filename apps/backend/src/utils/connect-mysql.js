import mysql from "mysql2/promise";
import { env } from "../config/env.js";

const { host, port, user, password, database } = env.db;

const pool = mysql.createPool({
  host: host,
  port: port,
  user: user,
  password: password,
  database: database,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

export default pool;
