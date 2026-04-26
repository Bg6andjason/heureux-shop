import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../utils/connect-mysql.js";
import { env } from "../config/env.js";

const router = express.Router();

/**
 * POST /auth/register
 * Body: email, password, name (optional)
 * 回傳 { ok, token, user: { id, email, name } } 或 { ok: false, message }
 */
router.post("/register", async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : null;

  if (!email || !password) {
    return res.status(400).json({ ok: false, message: "請提供 email 與 password" });
  }
  if (password.length < 6) {
    return res.status(400).json({ ok: false, message: "密碼至少 6 碼" });
  }

  const [[existing]] = await pool.query(
    "SELECT id FROM users WHERE email = ?",
    [email],
  );
  if (existing) {
    return res.status(409).json({ ok: false, message: "此 email 已註冊" });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const [insert] = await pool.query(
    "INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)",
    [email, password_hash, name || null],
  );
  const userId = Number(insert.insertId);
  const token = jwt.sign(
    { userId, email },
    env.jwtSecret,
    { expiresIn: "7d" },
  );

  res.status(201).json({
    ok: true,
    token,
    user: { id: userId, email, name: name || null },
  });
});

/**
 * POST /auth/login
 * Body: email, password
 * 回傳 { ok, token, user: { id, email, name } } 或 { ok: false, message }
 */
router.post("/login", async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!email || !password) {
    return res.status(400).json({ ok: false, message: "請提供 email 與 password" });
  }

  const [[row]] = await pool.query(
    "SELECT id, email, name, password_hash FROM users WHERE email = ?",
    [email],
  );
  if (!row) {
    return res.status(401).json({ ok: false, message: "email 或密碼錯誤" });
  }

  const match = await bcrypt.compare(password, row.password_hash);
  if (!match) {
    return res.status(401).json({ ok: false, message: "email 或密碼錯誤" });
  }

  const token = jwt.sign(
    { userId: row.id, email: row.email },
    env.jwtSecret,
    { expiresIn: "7d" },
  );

  res.json({
    ok: true,
    token,
    user: { id: row.id, email: row.email, name: row.name ?? null },
  });
});

export default router;
