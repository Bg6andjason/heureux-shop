import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function requireAdmin(req, res, next) {
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
