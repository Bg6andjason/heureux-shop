import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../utils/connect-mysql.js";
import { env } from "../config/env.js";

const router = express.Router();

function requireAdmin(req, res, next) {
  const authHeader = req.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return res.status(401).json({ ok: false, message: "Missing admin token" });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    if (!payload?.adminId || payload?.role !== "admin") {
      return res.status(403).json({ ok: false, message: "Invalid admin token" });
    }
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ ok: false, message: "Invalid admin token" });
  }
}

/**
 * POST /auth/register
 * Body: email, password, name (optional)
 * 回傳 { ok, token, user: { id, email, name } } 或 { ok: false, message }
 */
router.post("/register", async (req, res) => {
  const email =
    typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const password =
    typeof req.body?.password === "string" ? req.body.password : "";
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : null;

  if (!email || !password) {
    return res
      .status(400)
      .json({ ok: false, message: "請提供 email 與 password" });
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
  const token = jwt.sign({ userId, email }, env.jwtSecret, { expiresIn: "7d" });

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
  const email =
    typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const password =
    typeof req.body?.password === "string" ? req.body.password : "";

  if (!email || !password) {
    return res
      .status(400)
      .json({ ok: false, message: "請提供 email 與 password" });
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

  const token = jwt.sign({ userId: row.id, email: row.email }, env.jwtSecret, {
    expiresIn: "7d",
  });

  res.json({
    ok: true,
    token,
    user: { id: row.id, email: row.email, name: row.name ?? null },
  });
});

/**
 * POST /auth/admin/login
 * Body: email, password
 * 回傳 { ok, token, admin: { id, email, name } } 或 { ok: false, message }
 */
router.post("/admin/login", async (req, res) => {
  const email =
    typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const password =
    typeof req.body?.password === "string" ? req.body.password : "";

  if (!email || !password) {
    return res
      .status(400)
      .json({ ok: false, message: "請提供 email 與 password" });
  }

  const [[row]] = await pool.query(
    "SELECT id, email, name, password_hash FROM admin_users WHERE email = ?",
    [email],
  );
  if (!row) {
    return res.status(401).json({ ok: false, message: "管理員帳號或密碼錯誤" });
  }

  const match = await bcrypt.compare(password, row.password_hash);
  if (!match) {
    return res.status(401).json({ ok: false, message: "管理員帳號或密碼錯誤" });
  }

  const token = jwt.sign(
    { adminId: row.id, email: row.email, role: "admin" },
    env.jwtSecret,
    { expiresIn: "7d" },
  );

  res.json({
    ok: true,
    token,
    admin: { id: row.id, email: row.email, name: row.name ?? null },
  });
});

/**
 * GET /auth/admin/customers
 * Returns customer list with lightweight shopping summary.
 */
router.get("/admin/customers", requireAdmin, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT
        u.id,
        u.email,
        u.name,
        u.created_at,
        COUNT(DISTINCT o.id) AS order_count,
        COALESCE(SUM(oi.price * oi.quantity), 0) AS total_spent,
        (SELECT COALESCE(SUM(ci.quantity), 0) FROM cart_items ci WHERE ci.user_id = u.id) AS cart_count,
        (SELECT COUNT(*) FROM customer_favorites cf WHERE cf.user_id = u.id) AS wishlist_count
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      GROUP BY u.id, u.email, u.name, u.created_at
      ORDER BY u.created_at DESC, u.id DESC`,
  );

  res.json({ ok: true, items: rows });
});

/**
 * GET /auth/profile
 * Query: user_id
 * Returns basic account information and lightweight shopping summary.
 */
router.get("/profile", async (req, res) => {
  const userId = parseInt(req.query.user_id, 10);
  if (!Number.isInteger(userId) || userId < 1) {
    return res.status(400).json({ ok: false, message: "Invalid user id" });
  }

  const [[user]] = await pool.query(
    "SELECT id, email, name, created_at FROM users WHERE id = ?",
    [userId],
  );
  if (!user) {
    return res.status(404).json({ ok: false, message: "User not found" });
  }

  const [[orderSummary]] = await pool.query(
    `SELECT
        COUNT(o.id) AS order_count,
        COALESCE(SUM((SELECT COALESCE(SUM(oi.price * oi.quantity), 0) FROM order_items oi WHERE oi.order_id = o.id)), 0) AS total_spent
      FROM orders o
      WHERE o.user_id = ?`,
    [userId],
  );
  const [[cartSummary]] = await pool.query(
    "SELECT COALESCE(SUM(quantity), 0) AS cart_count FROM cart_items WHERE user_id = ?",
    [userId],
  );
  const [[wishlistSummary]] = await pool.query(
    "SELECT COUNT(*) AS wishlist_count FROM customer_favorites WHERE user_id = ?",
    [userId],
  );
  const totalSpent = Number(orderSummary?.total_spent ?? 0);
  const orderCount = Number(orderSummary?.order_count ?? 0);

  res.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      created_at: user.created_at,
      wishlist_count: Number(wishlistSummary?.wishlist_count ?? 0),
      cart_count: Number(cartSummary?.cart_count ?? 0),
      order_count: orderCount,
      total_spent: totalSpent,
    },
  });
});

export default router;
