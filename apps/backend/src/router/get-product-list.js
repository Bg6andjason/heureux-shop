import express from "express";
import pool from "../utils/connect-mysql.js";

const PER_PAGE = 20;

function escapeLike(s) {
  if (typeof s !== "string") return "";
  return s.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

const router = express.Router();

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

  const conditions = [];
  const bindings = [];

  if (q !== "") {
    const pattern = `%${escapeLike(q)}%`;
    conditions.push("(name LIKE ? OR description LIKE ?)");
    bindings.push(pattern, pattern);
  }
  if (category !== "") {
    conditions.push("category = ?");
    bindings.push(category);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const orderBy = (() => {
    // 僅允許白名單排序，避免 SQL injection
    if (sort === "newest" || sort === "") return "created_at DESC, id DESC";
    if (sort === "oldest") return "created_at ASC, id ASC";
    if (sort === "price_asc") return "price ASC, id DESC";
    if (sort === "price_desc") return "price DESC, id DESC";
    return "created_at DESC, id DESC";
  })();

  const [rows] = await pool.query(
    `SELECT * FROM products ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
    [...bindings, PER_PAGE, offset],
  );
  res.json({ ok: true, items: rows });
});

export default router;
