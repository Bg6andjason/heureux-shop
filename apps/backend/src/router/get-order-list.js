import express from "express";
import pool from "../utils/connect-mysql.js";

const PER_PAGE = 20;
const router = express.Router();

/**
 * GET /orders
 * Query: page, user_id (optional), status (optional)
 */
router.get("/", async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const offset = (page - 1) * PER_PAGE;
  const user_id =
    typeof req.query.user_id !== "undefined"
      ? parseInt(req.query.user_id, 10)
      : null;
  const status =
    typeof req.query.status === "string" ? req.query.status.trim() : "";

  const conditions = [];
  const bindings = [];
  if (Number.isInteger(user_id) && user_id > 0) {
    conditions.push("o.user_id = ?");
    bindings.push(user_id);
  }
  if (status !== "") {
    conditions.push("o.status = ?");
    bindings.push(status);
  }
  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const [orders] = await pool.query(
    `SELECT o.id, o.user_id,
        (SELECT COALESCE(SUM(oi.price * oi.quantity), 0) FROM order_items oi WHERE oi.order_id = o.id) AS total,
        o.status, o.created_at
    FROM orders o
    ${whereClause}
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?`,
    [...bindings, PER_PAGE, offset],
  );
  res.json({ ok: true, items: orders });
});

/**
 * GET /orders/:id
 */
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ ok: false, message: "Invalid order id" });
  }
  const [[order]] = await pool.query(
    "SELECT id, user_id, status, created_at FROM orders WHERE id = ?",
    [id],
  );
  if (!order) {
    return res.status(404).json({ ok: false, message: "Order not found" });
  }
  const [items] = await pool.query(
    `SELECT oi.id, oi.product_id, COALESCE(p.name, '') AS name, oi.price, oi.quantity
     FROM order_items oi
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = ?
     ORDER BY oi.id`,
    [id],
  );
  const total = items.reduce(
    (sum, row) => sum + Number(row.price) * Number(row.quantity),
    0,
  );
  res.json({ ok: true, item: { ...order, total, items } });
});

export default router;
