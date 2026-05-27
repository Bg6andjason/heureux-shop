import express from "express";
import cors from "cors";
import { env } from "./src/config/env.js";
import getProductList from "./src/router/get-product-list.js";
import getOrderList from "./src/router/get-order-list.js";
import cartRouter from "./src/router/cart.js";
import authRouter from "./src/router/auth.js";
import favoritesRouter from "./src/router/favorites.js";

const app = express();

console.log("CORS_ORIGIN raw:", process.env.CORS_ORIGIN);
console.log("env.corsOrigin:", env.corsOrigin);
console.log("isArray:", Array.isArray(env.corsOrigin));

app.use((req, res, next) => {
  console.log("REQ:", req.method, req.path, "origin:", req.headers.origin);
  next();
});

app.use(
  cors({
    origin: env.corsOrigin,
  }),
);
app.use(express.json());

app.use("/api/products", getProductList);
app.use("/orders", getOrderList);
app.use("/cart", cartRouter);
app.use("/auth", authRouter);
app.use("/favorites", favoritesRouter);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// app.get("/api/products", (req, res) => {
//   res.json({
//     items: [
//       { id: 1, name: "經典拿鐵", price: 140 },
//       { id: 2, name: "海鹽焦糖拿鐵", price: 160 },
//     ],
//   });
// });

app.listen(env.port, () => {
  console.log(`API server running on http://localhost:${env.port}`);
});
