import express from "express";
import { requireAdmin } from "../middleware/require-admin.js";
import pool from "../utils/connect-mysql.js";

const PER_PAGE = 20;

function escapeLike(s) {
  if (typeof s !== "string") return "";
  return s.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

const router = express.Router();

function parseProductId(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ ok: false, message: "Invalid product id" });
    return null;
  }
  return id;
}

function readProductPayload(body) {
  return {
    name: typeof body?.name === "string" ? body.name.trim() : "",
    price: Number(body?.price),
    stock: Number(body?.stock),
    category: typeof body?.category === "string" ? body.category.trim() : "",
    description:
      typeof body?.description === "string" ? body.description.trim() : "",
    imageUrl: typeof body?.image_url === "string" ? body.image_url.trim() : "",
  };
}

function validateProductPayload(payload, res) {
  if (!payload.name) {
    res.status(400).json({ ok: false, message: "請輸入商品名稱" });
    return false;
  }

  if (!Number.isInteger(payload.price) || payload.price < 0) {
    res.status(400).json({ ok: false, message: "請輸入有效價格" });
    return false;
  }

  if (!Number.isInteger(payload.stock) || payload.stock < 0) {
    res.status(400).json({ ok: false, message: "請輸入有效庫存" });
    return false;
  }

  return true;
}

router.get("/categories", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category",
  );
  const items = rows.map((r) => r.category);
  res.json({ ok: true, items });
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ ok: false, message: "Invalid product id" });
    }

    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Product not found" });
    }

    res.json({ ok: true, item: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

router.get("/", async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const offset = (page - 1) * PER_PAGE;
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const category =
    typeof req.query.category === "string" ? req.query.category.trim() : "";
  const sort = typeof req.query.sort === "string" ? req.query.sort.trim() : "";
  const userId = parseInt(req.query.user_id, 10);
  const hasUserId = Number.isInteger(userId) && userId > 0;

  const conditions = [];
  const bindings = [];

  if (q !== "") {
    const pattern = `%${escapeLike(q)}%`;
    conditions.push("(p.name LIKE ? OR p.description LIKE ?)");
    bindings.push(pattern, pattern);
  }
  if (category !== "") {
    conditions.push("p.category = ?");
    bindings.push(category);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const orderBy = (() => {
    // 僅允許白名單排序，避免 SQL injection
    if (sort === "newest" || sort === "") return "p.created_at DESC, p.id DESC";
    if (sort === "oldest") return "p.created_at ASC, p.id ASC";
    if (sort === "price_asc") return "p.price ASC, p.id DESC";
    if (sort === "price_desc") return "p.price DESC, p.id DESC";
    return "p.created_at DESC, p.id DESC";
  })();

  const favoriteSelect = hasUserId
    ? ", CASE WHEN f.id IS NULL THEN 0 ELSE 1 END AS is_favorite"
    : ", 0 AS is_favorite";
  const favoriteJoin = hasUserId
    ? "LEFT JOIN customer_favorites f ON f.product_id = p.id AND f.user_id = ?"
    : "";
  const [rows] = await pool.query(
    `SELECT p.*${favoriteSelect}
      FROM products p
      ${favoriteJoin}
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?`,
    [...(hasUserId ? [userId] : []), ...bindings, PER_PAGE, offset],
  );
  res.json({ ok: true, items: rows });
});

router.post("/", requireAdmin, async (req, res) => {
  const payload = readProductPayload(req.body);
  if (!validateProductPayload(payload, res)) {
    return;
  }

  try {
    const [insert] = await pool.query(
      `INSERT INTO products (name, price, description, category, stock, image_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        payload.name,
        payload.price,
        payload.description || null,
        payload.category || null,
        payload.stock,
        payload.imageUrl || null,
      ],
    );

    const [[product]] = await pool.query("SELECT * FROM products WHERE id = ?", [
      insert.insertId,
    ]);

    res.status(201).json({ ok: true, item: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const id = parseProductId(req, res);
  if (!id) return;

  const payload = readProductPayload(req.body);
  if (!validateProductPayload(payload, res)) {
    return;
  }

  try {
    const [update] = await pool.query(
      `UPDATE products
       SET name = ?, price = ?, description = ?, category = ?, stock = ?, image_url = ?
       WHERE id = ?`,
      [
        payload.name,
        payload.price,
        payload.description || null,
        payload.category || null,
        payload.stock,
        payload.imageUrl || null,
        id,
      ],
    );

    if (update.affectedRows === 0) {
      return res.status(404).json({ ok: false, message: "Product not found" });
    }

    const [[product]] = await pool.query("SELECT * FROM products WHERE id = ?", [
      id,
    ]);

    res.json({ ok: true, item: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const id = parseProductId(req, res);
  if (!id) return;

  try {
    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, message: "Product not found" });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

export default router;
