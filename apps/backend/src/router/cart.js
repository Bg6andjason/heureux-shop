import express from "express";
import pool from "../utils/connect-mysql.js";

const router = express.Router();
// const DEFAULT_USER_ID = 1;

function getUserId(req) {
  const q = req.query.user_id ?? req.body?.user_id; //正式環境取 body 就好，因為 user_id 不可能放在 query string
  const id = typeof q !== "undefined" ? parseInt(q, 10) : NaN; //:後原本是default 1
  return Number.isInteger(id) && id > 0 ? id : null; //:後原本是default 1
}

/**
 * GET /cart/count
 * Query: user_id (optional, default 1)
 * Returns total item count (sum of quantities).
 */
router.get("/count", async (req, res) => {
  const user_id = getUserId(req);
  if (!user_id) {
    return res.status(400).json({ ok: false, message: "Invalid user id" });
  }
  const [[row]] = await pool.query(
    "SELECT COALESCE(SUM(quantity), 0) AS count FROM cart_items WHERE user_id = ?",
    [user_id],
  );
  res.json({ ok: true, count: Number(row?.count ?? 0) });
});

/**
 * GET /cart/list
 * Query: user_id (optional, default 1)
 * Returns cart items with product info.
 */
router.get("/list", async (req, res) => {
  const user_id = getUserId(req);
  const [rows] = await pool.query(
    `SELECT c.id, c.user_id, c.product_id, c.quantity, c.created_at,
        p.name, p.price, p.image_url, p.stock
    FROM cart_items c
    JOIN products p ON p.id = c.product_id
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC`,
    [user_id],
  );
  res.json({ ok: true, items: rows });
});

/**
 * POST /cart/add
 * Body: user_id (optional), product_id, quantity (optional, default 1)
 */
router.post("/add", async (req, res) => {
  const user_id = getUserId(req);
  const product_id = parseInt(req.body?.product_id, 10);
  const quantity = Math.max(1, parseInt(req.body?.quantity, 10) || 1);

  if (!Number.isInteger(product_id) || product_id < 1) {
    return res.status(400).json({ ok: false, message: "Invalid product_id" });
  }

  const [[product]] = await pool.query(
    "SELECT id, name, price, stock FROM products WHERE id = ?",
    [product_id],
  );
  if (!product) {
    return res.status(404).json({ ok: false, message: "Product not found" });
  }

  const [existing] = await pool.query(
    "SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?",
    [user_id, product_id],
  );

  if (existing.length > 0) {
    const newQty = Math.min(
      (existing[0].quantity || 0) + quantity,
      product.stock ?? 999,
    );
    await pool.query("UPDATE cart_items SET quantity = ? WHERE id = ?", [
      newQty,
      existing[0].id,
    ]);
    const [[updated]] = await pool.query(
      "SELECT id, product_id, quantity FROM cart_items WHERE id = ?",
      [existing[0].id],
    );
    return res.json({ ok: true, item: updated });
  }

  const qty = Math.min(quantity, product.stock ?? 999);
  const [insert] = await pool.query(
    "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)",
    [user_id, product_id, qty],
  );
  const [[created]] = await pool.query(
    "SELECT id, product_id, quantity FROM cart_items WHERE id = ?",
    [insert.insertId],
  );
  res.status(201).json({ ok: true, item: created });
});

/**
 * PATCH /cart/:id
 * Body: quantity (required)
 * Query: user_id (optional)
 */
router.patch("/:id", async (req, res) => {
  const user_id = getUserId(req);
  const id = parseInt(req.params.id, 10);
  const quantity = parseInt(req.body?.quantity, 10);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ ok: false, message: "Invalid item id" });
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ ok: false, message: "Invalid quantity" });
  }

  const [[row]] = await pool.query(
    "SELECT c.id, p.stock FROM cart_items c JOIN products p ON p.id = c.product_id WHERE c.id = ? AND c.user_id = ?",
    [id, user_id],
  );
  if (!row) {
    return res.status(404).json({ ok: false, message: "Cart item not found" });
  }

  const qty = Math.min(quantity, row.stock ?? 999);
  await pool.query("UPDATE cart_items SET quantity = ? WHERE id = ?", [
    qty,
    id,
  ]);
  const [[updated]] = await pool.query(
    "SELECT id, product_id, quantity FROM cart_items WHERE id = ?",
    [id],
  );
  res.json({ ok: true, item: updated });
});

/**
 * POST /cart/checkout
 * Body: user_id (optional)
 * Creates an order from current cart, then clears the cart. Returns the new order id.
 */
router.post("/checkout", async (req, res) => {
  const user_id = getUserId(req);

  const [cartRows] = await pool.query(
    `SELECT c.id, c.product_id, c.quantity, p.name, p.price
    FROM cart_items c
    JOIN products p ON p.id = c.product_id
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC`,
    [user_id],
  );
  if (cartRows.length === 0) {
    return res.status(400).json({ ok: false, message: "購物車是空的" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [orderInsert] = await connection.query(
      "INSERT INTO orders (user_id, total_amount, status) VALUES (?, 0, 'pending')",
      [user_id],
    );
    const order_id = Number(orderInsert.insertId);

    for (const row of cartRows) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, price, quantity)
        VALUES (?, ?, ?, ?)`,
        [order_id, row.product_id, row.price, row.quantity],
      );
    }

    await connection.query("DELETE FROM cart_items WHERE user_id = ?", [
      user_id,
    ]);
    await connection.commit();
    res.status(201).json({ ok: true, order_id });
  } catch (err) {
    await connection.rollback();
    console.error("Checkout error:", err);
    res.status(500).json({
      ok: false,
      message: err?.message ?? "結帳失敗",
    });
  } finally {
    connection.release();
  }
});

/**
 * DELETE /cart/:id
 * Query: user_id (optional)
 */
router.delete("/:id", async (req, res) => {
  const user_id = getUserId(req);
  const id = parseInt(req.params.id, 10);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ ok: false, message: "Invalid item id" });
  }

  const [result] = await pool.query(
    "DELETE FROM cart_items WHERE id = ? AND user_id = ?",
    [id, user_id],
  );
  if (result.affectedRows === 0) {
    return res.status(404).json({ ok: false, message: "Cart item not found" });
  }
  res.json({ ok: true });
});

export default router;
