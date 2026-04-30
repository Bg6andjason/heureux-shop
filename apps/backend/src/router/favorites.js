import express from "express";
import pool from "../utils/connect-mysql.js";

const router = express.Router();

function getUserId(req) {
  const q = req.query.user_id ?? req.body?.user_id;
  const id = typeof q !== "undefined" ? parseInt(q, 10) : NaN;
  return Number.isInteger(id) && id > 0 ? id : null;
}

function getProductId(req) {
  const q = req.query.product_id ?? req.body?.product_id;
  const id = typeof q !== "undefined" ? parseInt(q, 10) : NaN;
  return Number.isInteger(id) && id > 0 ? id : null;
}

router.get("/list", async (req, res) => {
  const user_id = getUserId(req);
  if (!user_id) {
    return res.status(400).json({ ok: false, message: "Invalid user id" });
  }

  const [rows] = await pool.query(
    `SELECT f.id, f.user_id, f.product_id, f.created_at,
        p.name, p.price, p.image_url, p.category, p.description, p.stock
      FROM customer_favorites f
      JOIN products p ON p.id = f.product_id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC`,
    [user_id],
  );
  res.json({ ok: true, items: rows });
});

router.get("/status", async (req, res) => {
  const user_id = getUserId(req);
  const product_id = getProductId(req);
  if (!user_id) {
    return res.status(400).json({ ok: false, message: "Invalid user id" });
  }
  if (!product_id) {
    return res.status(400).json({ ok: false, message: "Invalid product id" });
  }

  const [[row]] = await pool.query(
    "SELECT id FROM customer_favorites WHERE user_id = ? AND product_id = ?",
    [user_id, product_id],
  );
  res.json({ ok: true, is_favorite: Boolean(row) });
});

router.post("/toggle", async (req, res) => {
  const user_id = getUserId(req);
  const product_id = getProductId(req);
  if (!user_id) {
    return res.status(400).json({ ok: false, message: "Invalid user id" });
  }
  if (!product_id) {
    return res.status(400).json({ ok: false, message: "Invalid product id" });
  }

  const [[product]] = await pool.query(
    "SELECT id FROM products WHERE id = ?",
    [product_id],
  );
  if (!product) {
    return res.status(404).json({ ok: false, message: "Product not found" });
  }

  const [[existing]] = await pool.query(
    "SELECT id FROM customer_favorites WHERE user_id = ? AND product_id = ?",
    [user_id, product_id],
  );

  if (existing) {
    await pool.query("DELETE FROM customer_favorites WHERE id = ?", [
      existing.id,
    ]);
    return res.json({ ok: true, is_favorite: false });
  }

  await pool.query(
    `INSERT INTO customer_favorites (user_id, product_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE created_at = created_at`,
    [user_id, product_id],
  );
  res.status(201).json({ ok: true, is_favorite: true });
});

router.delete("/:productId", async (req, res) => {
  const user_id = getUserId(req);
  const product_id = parseInt(req.params.productId, 10);
  if (!user_id) {
    return res.status(400).json({ ok: false, message: "Invalid user id" });
  }
  if (!Number.isInteger(product_id) || product_id < 1) {
    return res.status(400).json({ ok: false, message: "Invalid product id" });
  }

  const [result] = await pool.query(
    "DELETE FROM customer_favorites WHERE user_id = ? AND product_id = ?",
    [user_id, product_id],
  );
  if (result.affectedRows === 0) {
    return res.status(404).json({ ok: false, message: "Favorite not found" });
  }
  res.json({ ok: true });
});

export default router;
