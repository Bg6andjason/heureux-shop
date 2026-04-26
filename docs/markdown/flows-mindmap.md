# HEUREUX 專案 Flow 心智圖與程式碼對照

本文件整理專案內每一條使用者操作 Flow，以心智圖呈現節點關係，並對應實際程式碼位置（檔案路徑與行號）。

---

## 1. 總覽：Flow 清單

| Flow | 說明 | 前端路由 | 後端 Endpoint | DB Table |
|------|------|----------|---------------|----------|
| **A. 商品列表** | 進入商品列表頁、搜尋/分類、分頁，取得並渲染商品卡片 | `/products` | `GET /product/product-list`、`GET /product/categories` | `products` |
| **B. 商品詳細** | 點商品卡片進入詳情頁，顯示單一商品圖片/價格/描述 | `/products/[id]` | `GET /product/detail/:id` | `products` |
| **C. 加入購物車** | 點「加入購物車」→ 呼叫 API → 更新 UI（toast、購物車數量泡泡） | 商品頁/列表頁 | `POST /cart/add` | `products`、`cart_items` |
| **D. 查看購物車** | 點購物車 icon/連結進入購物車頁，顯示品項與總價 | `/cart` | `GET /cart/list` | `cart_items`、`products` |
| **E. 購物車數量泡泡** | Navbar 顯示購物車總件數；mount 與 `cart-updated` 事件時 fetch | （Navbar 內） | `GET /cart/count` | `cart_items` |
| **F. 修改購物車數量** | 購物車頁 +/- 按鈕，PATCH 更新數量，刷新列表與泡泡 | `/cart` | `PATCH /cart/item/:id` | `cart_items`、`products`（查 stock） |
| **G. 刪除購物車項目** | 購物車頁「移除」→ DELETE → 刷新列表與泡泡 | `/cart` | `DELETE /cart/item/:id` | `cart_items` |
| **H. 訂單列表** | 訂單列表頁，分頁與狀態篩選 | `/orders` | `GET /order/order-list` | `orders`、`order_items`（子查詢） |
| **I. 訂單詳細** | 點訂單進入詳情，顯示訂單與明細 | `/orders/[id]` | `GET /order/detail/:id` | `orders`、`order_items` |

---

## 2. 各 Flow 心智圖與節點對應代碼

---

### Flow A：商品列表（Product List）

**使用者操作（白話）**  
使用者進入首頁或點「Product List」到 `/products`，可搜尋關鍵字、選分類、換頁。前端向後端要商品列表與分類，後端查 DB 後回傳 JSON，前端用卡片渲染。

**心智圖（ASCII）**

```
使用者進入 /products（或首頁看到精選商品）
    │
    ├─→ [前端] 商品列表頁 ProductsPage (page, q, category)
    │       │
    │       ├─→ getCategories() ──→ GET /product/categories
    │       │       │
    │       │       └─→ [後端] router.get("/categories") → SQL products → res.json({ items })
    │       │
    │       └─→ getProducts(page, q, category) ──→ GET /product/product-list?page=&q=&category=
    │               │
    │               └─→ [後端] router.get("/product-list") → WHERE 組條件 → SELECT products → res.json({ items })
    │
    └─→ [前端] 渲染 ProductCard 列表 + 分頁 + 分類 Tab
```

**節點對應代碼**

| 節點 | 代碼位置 | 程式碼片段 | 白話解釋 | 舉例 |
|------|----------|------------|----------|------|
| 進入商品列表頁 | `heureux-frontend/src/app/products/page.tsx`: Line 58–70 | `export default async function ProductsPage({ searchParams })`、`const [categories, { items: products, perPage }] = await Promise.all([getCategories(), getProducts(page, q, category)])` | 頁面為 Server Component，用 URL 的 page / q / category 同時拉分類與商品。 | 造訪 `/products?page=2&category=coffee` 會帶入 page=2、category=coffee 去 fetch。 |
| 前端 fetch 分類 | `heureux-frontend/src/app/products/page.tsx`: Line 7–16 | `const res = await fetch(\`${baseUrl}/product/categories\`, { cache: "no-store" })` | 呼叫後端取得所有商品分類，不 cache 以拿到最新資料。 | 回傳 `{ ok: true, items: ["coffee", "tea"] }`。 |
| 後端 categories router | `heureux-backend/src/router/get-product-list.js`: Line 27–32 | `router.get("/categories", async (req, res) => { const [rows] = await pool.query("SELECT DISTINCT category FROM products ..."); res.json({ ok: true, items: rows.map(r => r.category) })` | 從 products 取不重複 category，回傳字串陣列。 | 表裡有 coffee、tea → items: ["coffee","tea"]。 |
| 前端 fetch 商品列表 | `heureux-frontend/src/app/products/page.tsx`: Line 18–43 | `const res = await fetch(\`${baseUrl}/product/product-list?${params.toString()}\`, { cache: "no-store" })` | 用 page、q、category 組 query 打 product-list，解析 body.items。 | page=1&category=tea → 只查 category=tea 的產品。 |
| 後端掛載 /product | `heureux-backend/index.js`: Line 17 | `app.use("/product", getProductList)` | Express 把 /product 前綴交給 get-product-list router。 | 請求 GET /product/product-list 會進 get-product-list.js。 |
| 後端 product-list 解析與 SQL | `heureux-backend/src/router/get-product-list.js`: Line 35–60 | `const page = Math.max(1, parseInt(req.query.page, 10) || 1)`、`whereClause`、`pool.query("SELECT * FROM products ${whereClause} ORDER BY id LIMIT ? OFFSET ?", [...bindings, PER_PAGE, offset])` | 解析 page/q/category，組 WHERE（LIKE 與 category），分頁 LIMIT/OFFSET，查 products。 | page=2、q=拿鐵 → OFFSET 20、LIMIT 20，name/description LIKE %拿鐵%。 |
| 回傳 JSON | `heureux-backend/src/router/get-product-list.js`: Line 59 | `res.json({ ok: true, items: products })` | 回傳 { ok, items } 陣列。 | 前端用 body.items 渲染。 |
| 前端渲染卡片 | `heureux-frontend/src/app/products/page.tsx`: Line 124–128 | `<ul className="grid ..."> {products.map((p) => <ProductCard key={p.id} product={p} />)} </ul>` | 用 ProductCard 把每個 product 畫成卡片。 | 每個 p 有 id、name、price、image_url 等。 |
| 商品卡片元件 | `heureux-frontend/src/app/components/ProductCard.tsx`: Line 19–65 | `<li>...<Link href={\`/products/${p.id}\`}>...<AddToCartButton productId={p.id} /></li>` | 卡片內含連結到 /products/:id 與加入購物車按鈕。 | 點卡片區塊會到商品詳情，點按鈕觸發 Flow C。 |

**首頁精選商品（同 API）**  
首頁「Latest Arrivals」也呼叫同一支 product-list API，只取前 4 筆：

- 前端：`heureux-frontend/src/app/page.tsx`: Line 9–21（`getLatestProducts()` 內 `fetch(\`${baseUrl}/product/product-list?page=1\`)`，再 `body.items.slice(0, 4)`）
- 渲染：Line 111–136（`latestProducts.map` → Link 到 `/products/${p.id}`）

---

### Flow B：商品詳細頁（Product Detail）

**使用者操作（白話）**  
使用者在列表或首頁點某商品卡片（或連結），進入 `/products/[id]`。前端用 id 向後端要單一商品，後端查 products by id 回傳，前端顯示圖片、價格、描述、庫存與「加入購物車」。

**心智圖（ASCII）**

```
使用者點商品卡片 / 連結
    │
    └─→ Next.js 路由：/products/[id]
            │
            ├─→ [前端] ProductDetailPage(params) → getProduct(id)
            │       │
            │       └─→ GET /product/detail/:id
            │               │
            │               └─→ [後端] router.get("/detail/:id") → 解析 id → SELECT * FROM products WHERE id = ?
            │                       └─→ res.json({ ok: true, item })
            │
            └─→ [前端] 渲染圖片、價格、描述、AddToCartButton
```

**節點對應代碼**

| 節點 | 代碼位置 | 程式碼片段 | 白話解釋 | 舉例 |
|------|----------|------------|----------|------|
| 點商品卡片／連結 | `heureux-frontend/src/app/components/ProductCard.tsx`: Line 23、55 | `<Link href={\`/products/${p.id}\`}>` | 卡片整塊與標題都是 Link，點擊會導向 /products/:id。 | 商品 id=3 → 前往 /products/3。 |
| 前端頁面與 fetch 詳細 | `heureux-frontend/src/app/products/[id]/page.tsx`: Line 40–53、18–26 | `const product = await getProduct(productId)`、`const res = await fetch(\`${baseUrl}/product/detail/${id}\`, { cache: "no-store" })` | 動態路由 [id] 從 params 取得，呼叫 getProduct 打 detail API，失敗則 notFound()。 | id=5 → GET /product/detail/5。 |
| 後端解析 :id 與查詢 | `heureux-backend/src/router/get-product-list.js`: Line 13–24 | `const id = parseInt(req.params.id, 10)`、`if (!Number.isInteger(id) \|\| id < 1) return res.status(400)...`、`const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id])` | 驗證 id 為正整數，查 products 單筆，沒有則 404。 | id=99 且不存在 → 404 Product not found。 |
| 回傳 JSON | `heureux-backend/src/router/get-product-list.js`: Line 24 | `res.json({ ok: true, item: rows[0] })` | 回傳單一 item 物件。 | 前端用 body.item 顯示名稱、價格、description、image_url、stock。 |
| 前端渲染詳情 | `heureux-frontend/src/app/products/[id]/page.tsx`: Line 55–134 | Image、product.name、product.price、product.description、product.stock、AddToCartButton | 左側大圖、右側標題/價格/描述/庫存與「Add to Bag」按鈕。 | 例如 NT$ 1,400、In stock: 10。 |

---

### Flow C：加入購物車（Add to Cart）

**使用者操作（白話）**  
使用者在商品詳情頁或列表卡片上點「加入購物車」。前端用 POST /cart/add 送 product_id、quantity，後端驗證商品存在、查/更新 cart_items（有則 UPDATE 數量，無則 INSERT），回傳 item。前端顯示「已加入購物車」toast，並觸發事件讓 Navbar 購物車數量泡泡更新。

**心智圖（ASCII）**

```
使用者點「加入購物車」
    │
    └─→ [前端] AddToCartButton handleClick
            │
            ├─→ addToCartApi(apiBaseUrl, productId) ──→ POST /cart/add body: { product_id, quantity: 1 }
            │       │
            │       └─→ [後端] router.post("/add")
            │               ├─→ getUserId(req)、驗證 product_id
            │               ├─→ SELECT products、SELECT cart_items (user_id, product_id)
            │               ├─→ 有則 UPDATE cart_items SET quantity、無則 INSERT cart_items
            │               └─→ res.json({ ok: true, item }) 或 201
            │
            └─→ [前端] ok 則 setShowModal(true)、dispatchEvent(CART_UPDATED_EVENT)、2 秒後關 modal
```

**節點對應代碼**

| 節點 | 代碼位置 | 程式碼片段 | 白話解釋 | 舉例 |
|------|----------|------------|----------|------|
| 使用者點按鈕 | `heureux-frontend/src/app/components/AddToCartButton.tsx`: Line 32–46 | `const handleClick = async (e) => { e.preventDefault(); e.stopPropagation(); ... const ok = await addToCartApi(apiBaseUrl, productId); if (ok) { setShowModal(true); window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT)); ... } }` | Client 元件：防止觸發 Link、呼叫 API，成功則顯示 modal 並發事件給購物車泡泡。 | 點一次送 product_id=2, quantity=1。 |
| 前端 POST /cart/add | `heureux-frontend/src/app/components/AddToCartButton.tsx`: Line 7–13 | `const res = await fetch(\`${apiBaseUrl}/cart/add\`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product_id: productId, quantity: 1 }) })` | 用環境變數 API base 打 POST，body 為 JSON。 | productId=3 → body: { product_id: 3, quantity: 1 }。 |
| 後端掛載 /cart | `heureux-backend/index.js`: Line 19 | `app.use("/cart", cartRouter)` | /cart 前綴交給 cart.js router。 | POST /cart/add 進入 cart.js。 |
| 後端驗證與取 user | `heureux-backend/src/router/cart.js`: Line 49–56、7–11 | `const user_id = getUserId(req)`、`const product_id = parseInt(req.body?.product_id, 10)`、`if (!Number.isInteger(product_id) \|\| product_id < 1) return res.status(400)...` | user_id 來自 query/body 或預設 1；驗證 product_id 為正整數。 | 沒傳 user_id → user_id=1。 |
| 後端查 products | `heureux-backend/src/router/cart.js`: Line 58–64 | `const [[product]] = await pool.query("SELECT id, name, price, stock FROM products WHERE id = ?", [product_id])`、`if (!product) return res.status(404)...` | 確認商品存在並取 stock 做數量上限。 | product_id=999 不存在 → 404。 |
| 後端查 cart_items 並 UPDATE/INSERT | `heureux-backend/src/router/cart.js`: Line 66–96 | `const [existing] = await pool.query("SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?", ...)`、有則 `UPDATE cart_items SET quantity = ?`、無則 `INSERT INTO cart_items (user_id, product_id, quantity)` | 同用戶同商品已存在就加總數量（上限 stock），否則新增一筆。 | 已有一筆 quantity=2，再加 1 → UPDATE 成 3。 |
| 回傳 item | `heureux-backend/src/router/cart.js`: Line 84、96 | `return res.json({ ok: true, item: updated })`、`res.status(201).json({ ok: true, item: created })` | 回傳最新 cart item（id, product_id, quantity）。 | 前端只檢查 res.ok，不一定要讀 item。 |
| 前端更新 UI（toast + 泡泡） | `heureux-frontend/src/app/components/AddToCartButton.tsx`: Line 39–41、73–93 | `setShowModal(true)`、`window.dispatchEvent(CART_UPDATED_EVENT)`、modal 顯示「已加入購物車」 | 顯示 modal；CartIconWithCount 監聽 CART_UPDATED_EVENT 會重新 fetch count。 | 加入後 Navbar 泡泡數字會更新。 |

**備註**  
專案內另有 Server Action：`heureux-frontend/src/app/actions/cart.ts` Line 5–19（`addToCart(formData)`）也呼叫 `POST /cart/add` 並 `redirect("/cart")`，目前詳情頁與 ProductCard 使用的是 AddToCartButton 的 client fetch，不是此 Server Action。

---

### Flow D：查看購物車（Cart List）

**使用者操作（白話）**  
使用者點 Navbar 的「Cart」或購物車 icon 進入 `/cart`。頁面載入時 fetch GET /cart/list，後端 join cart_items + products 回傳品項，前端渲染列表與小計。

**心智圖（ASCII）**

```
使用者點 Cart 連結 / icon
    │
    └─→ 路由 /cart → CartPage (Server Component)
            │
            ├─→ getCartItems() ──→ GET /cart/list
            │       │
            │       └─→ [後端] router.get("/list") → getUserId → SELECT cart_items JOIN products WHERE user_id = ?
            │               └─→ res.json({ ok: true, items: rows })
            │
            └─→ [前端] items.length === 0 顯示空狀態，否則 <ul> 每筆 CartActions + 小計 + 連結
```

**節點對應代碼**

| 節點 | 代碼位置 | 程式碼片段 | 白話解釋 | 舉例 |
|------|----------|------------|----------|------|
| 點購物車進入頁面 | `heureux-frontend/src/app/components/Navbar.tsx`: Line 18、32 | `<Link href="/cart">`、`<CartIconWithCount />`（點擊連到 /cart） | Navbar 有文字連結與 icon 連結到 /cart。 | 點「Cart」或購物車 icon 都會到 /cart。 |
| 前端 fetch cart list | `heureux-frontend/src/app/cart/page.tsx`: Line 23–33、36 | `async function getCartItems()`、`const res = await fetch(\`${baseUrl}/cart/list\`, { cache: "no-store" })`、`const items = await getCartItems()` | 頁面載入時向後端要當前使用者的購物車列表。 | 回傳 { ok, items: [{ id, product_id, quantity, name, price, image_url, stock }, ...] }。 |
| 後端 GET /cart/list | `heureux-backend/src/router/cart.js`: Line 32–43 | `router.get("/list", async (req, res) => { const user_id = getUserId(req); const [rows] = await pool.query("SELECT c.id, c.user_id, c.product_id, c.quantity, c.created_at, p.name, p.price, p.image_url, p.stock FROM cart_items c JOIN products p ON p.id = c.product_id WHERE c.user_id = ? ORDER BY c.created_at DESC", [user_id]); res.json({ ok: true, items: rows }) })` | 依 user_id 查 cart_items 並 join products 取得名稱、價格、圖片、庫存。 | user_id=1 → 該使用者所有購物車品項含商品資訊。 |
| 前端渲染列表 | `heureux-frontend/src/app/cart/page.tsx`: Line 59–103、37、105–110 | `items.map((item) => <li>...<CartActions item={item} />...NT$ {item.price * item.quantity}</li>)`、`subtotal = items.reduce(...)` | 每筆顯示圖片、名稱、單價、數量操作（CartActions）、小計；底下顯示總小計與「繼續選購」「前往結帳」。 | 三筆品項會有三張卡片與一個小計。 |

---

### Flow E：購物車數量泡泡（Cart Count Bubble）

**使用者操作（白話）**  
Navbar 右側購物車 icon 上顯示當前購物車總件數（SUM(quantity)）。元件 mount 時先 fetch 一次，之後每次發生「加入/修改/刪除購物車」時會觸發 CART_UPDATED_EVENT，再重新 fetch 更新數字。

**心智圖（ASCII）**

```
Navbar 渲染 → CartIconWithCount mount
    │
    ├─→ useEffect → fetchCount() ──→ GET /cart/count
    │       │
    │       └─→ [後端] router.get("/count") → getUserId → SELECT COALESCE(SUM(quantity), 0) FROM cart_items WHERE user_id = ?
    │               └─→ res.json({ ok: true, count })
    │
    ├─→ [前端] setCount(body.count)，顯示 count > 0 時泡泡
    │
    └─→ window.addEventListener(CART_UPDATED_EVENT, fetchCount)  → 加入/改數量/刪除後會再打一次 count
```

**節點對應代碼**

| 節點 | 代碼位置 | 程式碼片段 | 白話解釋 | 舉例 |
|------|----------|------------|----------|------|
| 何時 fetch count | `heureux-frontend/src/app/components/CartIconWithCount.tsx`: Line 22–27 | `useEffect(() => { const load = () => void fetchCount(); load(); window.addEventListener(CART_UPDATED_EVENT, load); return () => window.removeEventListener(CART_UPDATED_EVENT, load); }, [fetchCount])` | 元件掛載時先打一次；並監聽 CART_UPDATED_EVENT（AddToCartButton 成功、CartActions 改數量/刪除都會觸發）再打一次。 | 加入購物車成功 → dispatch CART_UPDATED_EVENT → 泡泡數字更新。 |
| 前端 GET /cart/count | `heureux-frontend/src/app/components/CartIconWithCount.tsx`: Line 11–20 | `const res = await fetch(\`${baseUrl}/cart/count\`, { cache: "no-store" })`、`const body = (await res.json()) as { ok: boolean; count?: number }`、`setCount(body.count)` | 呼叫 count API，把回傳的 count 存進 state 並顯示。 | 回傳 { ok: true, count: 5 } → 泡泡顯示 5。 |
| 後端 SQL SUM(quantity) | `heureux-backend/src/router/cart.js`: Line 18–25 | `router.get("/count", async (req, res) => { const user_id = getUserId(req); const [[row]] = await pool.query("SELECT COALESCE(SUM(quantity), 0) AS count FROM cart_items WHERE user_id = ?", [user_id]); res.json({ ok: true, count: Number(row?.count ?? 0) }) })` | 依 user_id 對 cart_items 做 SUM(quantity)，沒有則 0。 | 三筆 2+1+1 → count=4。 |
| 前端顯示泡泡 | `heureux-frontend/src/app/components/CartIconWithCount.tsx`: Line 30–45 | `<Link href="/cart">...{count !== null && count > 0 && <span className="...">{count > 99 ? "99+" : count}</span>}</Link>` | 僅在 count 不為 null 且 >0 時顯示右上角數字，超過 99 顯示 99+。 | count=3 → 顯示「3」。 |

---

### Flow F：修改購物車數量（Update Cart Item Quantity）

**使用者操作（白話）**  
在購物車頁對某品項按 +/- 按鈕。前端送 PATCH /cart/item/:id，body 為 { quantity }；後端檢查 item 存在且屬於該 user、quantity 不超過 stock 後 UPDATE，回傳 updated item。前端更新本地 state 並 router.refresh()、觸發 CART_UPDATED_EVENT 更新泡泡。

**心智圖（ASCII）**

```
使用者在 /cart 對某品項按 + 或 −
    │
    └─→ [前端] CartActions handleUpdate(newQty)
            │
            ├─→ PATCH /cart/item/:id body: { quantity: newQty }
            │       │
            │       └─→ [後端] router.patch("/item/:id")
            │               ├─→ 驗證 id、quantity
            │               ├─→ SELECT cart_items JOIN products (id, user_id, stock)
            │               ├─→ 無則 404；有則 qty = min(quantity, stock)、UPDATE cart_items
            │               └─→ res.json({ ok: true, item: updated })
            │
            └─→ res.ok → setQuantity(newQty)、dispatchEvent(CART_UPDATED_EVENT)、router.refresh()
```

**節點對應代碼**

| 節點 | 代碼位置 | 程式碼片段 | 白話解釋 | 舉例 |
|------|----------|------------|----------|------|
| 使用者按 +/- | `heureux-frontend/src/app/cart/CartActions.tsx`: Line 65–84 | `<button onClick={() => handleUpdate(Math.max(1, quantity - 1))}>−</button>`、`<button onClick={() => handleUpdate(Math.min(maxQty, quantity + 1))}>+</button>` | 減量至少 1、增量不超過 maxQty（來自 item.stock）。 | 目前 2、stock=10 → 按 + 變成 3。 |
| 前端 PATCH | `heureux-frontend/src/app/cart/CartActions.tsx`: Line 26–42 | `const res = await fetch(\`${apiBaseUrl}/cart/item/${item.id}\`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quantity: newQty }) })`、`if (res.ok) { setQuantity(newQty); window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT)); router.refresh(); }` | 用 cart item 的 id 打 PATCH，成功則更新本地數量、發事件、刷新頁面資料。 | item.id=7, newQty=3 → PATCH /cart/item/7 body { quantity: 3 }。 |
| 後端檢查 item、stock | `heureux-backend/src/router/cart.js`: Line 104–134 | `const [[row]] = await pool.query("SELECT c.id, p.stock FROM cart_items c JOIN products p ON p.id = c.product_id WHERE c.id = ? AND c.user_id = ?", [id, user_id])`、`if (!row) return res.status(404)...`、`const qty = Math.min(quantity, row.stock ?? 999)`、`await pool.query("UPDATE cart_items SET quantity = ? WHERE id = ?", [qty, id])` | 確認該 cart item 存在且屬於該 user，並用 product.stock  cap 數量後 UPDATE。 | quantity=5、stock=3 → 實際寫入 3。 |
| 回傳 updated item | `heureux-backend/src/router/cart.js`: Line 129–134 | `const [[updated]] = await pool.query("SELECT id, product_id, quantity FROM cart_items WHERE id = ?", [id]); res.json({ ok: true, item: updated })` | 回傳更新後的 cart item。 | 前端主要依 router.refresh() 重拿 list。 |

---

### Flow G：刪除購物車項目（Remove Cart Item）

**使用者操作（白話）**  
在購物車頁點某品項的「移除」。前端送 DELETE /cart/item/:id，後端確認 id 與 user_id 後刪除 cart_items 該筆，回傳 { ok: true }。前端 router.refresh() 並觸發 CART_UPDATED_EVENT 更新列表與泡泡。

**心智圖（ASCII）**

```
使用者在 /cart 點「移除」
    │
    └─→ [前端] CartActions handleRemove()
            │
            ├─→ DELETE /cart/item/:id
            │       │
            │       └─→ [後端] router.delete("/item/:id")
            │               ├─→ 驗證 id、getUserId
            │               ├─→ DELETE FROM cart_items WHERE id = ? AND user_id = ?
            │               ├─→ affectedRows === 0 → 404
            │               └─→ res.json({ ok: true })
            │
            └─→ res.ok → dispatchEvent(CART_UPDATED_EVENT)、router.refresh()
```

**節點對應代碼**

| 節點 | 代碼位置 | 程式碼片段 | 白話解釋 | 舉例 |
|------|----------|------------|----------|------|
| 使用者點移除 | `heureux-frontend/src/app/cart/CartActions.tsx`: Line 45–57、86–92 | `const handleRemove = async () => { ... const res = await fetch(..., { method: "DELETE" }); if (res.ok) { window.dispatchEvent(...); router.refresh(); } }`、`<button onClick={handleRemove}>移除</button>` | 送 DELETE 到該 cart item id，成功則發事件並刷新頁面。 | item.id=7 → DELETE /cart/item/7。 |
| 後端刪除 cart_items | `heureux-backend/src/router/cart.js`: Line 140–157 | `router.delete("/item/:id", async (req, res) => { const user_id = getUserId(req); const id = parseInt(req.params.id, 10); ... const [result] = await pool.query("DELETE FROM cart_items WHERE id = ? AND user_id = ?", [id, user_id]); if (result.affectedRows === 0) return res.status(404)...; res.json({ ok: true }) })` | 只刪除符合 id 且 user_id 的那一筆，避免刪到別人的。 | id=7、user_id=1 且存在 → 刪除並 200。 |
| 前端更新 UI | `heureux-frontend/src/app/cart/CartActions.tsx`: Line 51–54 | `router.refresh()` 使 Cart 頁重新執行 getCartItems()；CART_UPDATED_EVENT 使 CartIconWithCount 重打 count。 | 列表少一筆、泡泡數字減少。 |

---

### Flow H：訂單列表（Order List）

**使用者操作（白話）**  
使用者進入 `/orders`，可選狀態 Tab 與分頁。前端 GET /order/order-list?page=&status=&user_id=，後端組 whereClause 查 orders（含子查詢算 total），回傳列表，前端渲染訂單卡片與分頁。

**心智圖（ASCII）**

```
使用者進入 /orders（或點「前往結帳」後從 /cart 連過來）
    │
    └─→ [前端] OrdersPage(searchParams) → getOrders(page, status)
            │
            ├─→ GET /order/order-list?page=&status=
            │       │
            │       └─→ [後端] router.get("/order-list")
            │               ├─→ 解析 page、user_id、status，組 conditions / whereClause
            │               ├─→ SELECT orders + 子查詢 (SELECT SUM(price*quantity) FROM order_items) AS total
            │               └─→ res.json({ ok: true, items: orders })
            │
            └─→ [前端] 狀態 Tab + 訂單列表 + 每筆 Link 到 /orders/:id
```

**節點對應代碼**

| 節點 | 代碼位置 | 程式碼片段 | 白話解釋 | 舉例 |
|------|----------|------------|----------|------|
| 前端 GET order-list | `heureux-frontend/src/app/orders/page.tsx`: Line 22–36、61–68 | `const params = new URLSearchParams({ page: String(page) }); if (status) params.set("status", status)`、`const res = await fetch(\`${baseUrl}/order/order-list?${params.toString()}\`, { cache: "no-store" })` | 用 page、status 組 query 打 order-list，解析 body.items。 | ?page=2&status=paid 只查已付款。 |
| 後端掛載 /order | `heureux-backend/index.js`: Line 18 | `app.use("/order", getOrderList)` | /order 前綴交給 get-order-list.js。 | GET /order/order-list 進入 get-order-list.js。 |
| 後端組 whereClause | `heureux-backend/src/router/get-order-list.js`: Line 11–31 | `const page = ... offset = (page - 1) * PER_PAGE`、`user_id`、`status`、`conditions.push("o.user_id = ?")`、`conditions.push("o.status = ?")`、`whereClause = conditions.length > 0 ? \`WHERE ${conditions.join(" AND ")}\` : ""` | 可選篩 user_id、status，組成 WHERE 條件。 | status=completed → WHERE o.status = ?。 |
| 後端 SQL 查 orders | `heureux-backend/src/router/get-order-list.js`: Line 33–43 | `const [orders] = await pool.query(\`SELECT o.id, o.user_id, (SELECT COALESCE(SUM(oi.price * oi.quantity), 0) FROM order_items oi WHERE oi.order_id = o.id) AS total, o.status, o.created_at FROM orders o ${whereClause} ORDER BY o.created_at DESC LIMIT ? OFFSET ?\`, [...bindings, PER_PAGE, offset])` | 查 orders 表，每筆用子查詢算 order_items 總金額。 | 回傳 [{ id, user_id, total, status, created_at }, ...]。 |
| 回傳與前端渲染 | `heureux-backend/src/router/get-order-list.js`: Line 43 | `res.json({ ok: true, items: orders })` | 回傳訂單陣列。 | 前端用 order.id、order.total、order.status、order.created_at 渲染。 |
| 前端渲染列表 | `heureux-frontend/src/app/orders/page.tsx`: Line 113–151 | `orders.map((order) => <li><Link href={\`/orders/${order.id}\`}>訂單 #order.id、formatDate、狀態、NT$ order.total</Link></li>)` | 每筆訂單一個 Link 到詳情頁。 | 點訂單 #5 → /orders/5（Flow I）。 |

---

### Flow I：訂單詳細（Order Detail）

**使用者操作（白話）**  
在訂單列表點某一筆訂單，進入 `/orders/[id]`。前端 GET /order/detail/:id，後端查 orders 單筆再查 order_items，組合成含 items 的 item 並算 total，回傳 JSON。前端渲染訂單標頭與明細表格。

**心智圖（ASCII）**

```
使用者點訂單卡片
    │
    └─→ 路由 /orders/[id] → OrderDetailPage(params)
            │
            ├─→ getOrder(id) ──→ GET /order/detail/:id
            │       │
            │       └─→ [後端] router.get("/detail/:id")
            │               ├─→ 解析 id、SELECT orders WHERE id = ?
            │               ├─→ SELECT order_items WHERE order_id = ?
            │               ├─→ 組 total、item = { ...order, total, items }
            │               └─→ res.json({ ok: true, item })
            │
            └─→ [前端] 渲染訂單 #id、狀態、時間、表格（商品名、單價、數量、小計）、總計
```

**節點對應代碼**

| 節點 | 代碼位置 | 程式碼片段 | 白話解釋 | 舉例 |
|------|----------|------------|----------|------|
| 點訂單進入詳情 | `heureux-frontend/src/app/orders/page.tsx`: Line 116–118 | `<Link href={\`/orders/${order.id}\`}>` | 列表每筆訂單都可點進詳情。 | 訂單 id=12 → /orders/12。 |
| 前端 GET detail | `heureux-frontend/src/app/orders/[id]/page.tsx`: Line 27–35、52–64 | `async function getOrder(id)`、`const res = await fetch(\`${baseUrl}/order/detail/${id}\`, { cache: "no-store" })`、`const order = await getOrder(orderId)` | 用動態路由 id 打 detail API，無資料則 notFound()。 | id=12 → GET /order/detail/12。 |
| 後端查 orders + order_items | `heureux-backend/src/router/get-order-list.js`: Line 48–69 | `const id = parseInt(req.params.id, 10)`、`const [[order]] = await pool.query("SELECT id, user_id, status, created_at FROM orders WHERE id = ?", [id])`、`const [items] = await pool.query("SELECT id, product_id, name, price, quantity FROM order_items WHERE order_id = ? ORDER BY id", [id])`、`const total = items.reduce(...)`、`res.json({ ok: true, item: { ...order, total, items } })` | 先取訂單主檔，再取明細，前端可選用後端算的 total 或自己加總。 | 回傳 { id, user_id, status, created_at, total, items: [{ product_id, name, price, quantity }, ...] }。 |
| 前端渲染詳情 | `heureux-frontend/src/app/orders/[id]/page.tsx`: Line 67–141 | 返回連結、訂單 #、狀態、下單時間、表格 thead/tbody、order.items.map、訂單總計 NT$ order.total | 表格式列出每筆明細與總價。 | 例如三筆 order_items 會有三列 + 一列總計。 |

---

## 3. 快速對照表

| Flow | 前端路由/位置 | 後端 Endpoint | 後端檔案（路徑: 行號） | 前端主要檔案（路徑: 行號） | DB Table |
|------|----------------|---------------|-------------------------|-----------------------------|----------|
| A 商品列表 | `/products`、首頁 | `GET /product/categories`、`GET /product/product-list` | `heureux-backend/src/router/get-product-list.js`: 27–32、35–60；`index.js`: 17 | `heureux-frontend/src/app/products/page.tsx`: 7–16、18–43、58–70、124–128；`page.tsx`: 9–21、111–136 | `products` |
| B 商品詳細 | `/products/[id]` | `GET /product/detail/:id` | `get-product-list.js`: 13–24；`index.js`: 17 | `heureux-frontend/src/app/products/[id]/page.tsx`: 18–26、40–53、55–134；`ProductCard.tsx`: 23、55 | `products` |
| C 加入購物車 | 商品頁、列表卡片 | `POST /cart/add` | `heureux-backend/src/router/cart.js`: 49–96；`index.js`: 19 | `AddToCartButton.tsx`: 7–13、32–46、73–93 | `products`、`cart_items` |
| D 查看購物車 | `/cart` | `GET /cart/list` | `cart.js`: 32–43；`index.js`: 19 | `heureux-frontend/src/app/cart/page.tsx`: 23–33、36、59–110；`Navbar.tsx`: 18、32 | `cart_items`、`products` |
| E 購物車泡泡 | Navbar | `GET /cart/count` | `cart.js`: 18–25；`index.js`: 19 | `CartIconWithCount.tsx`: 11–27、30–45；`Navbar.tsx`: 25 | `cart_items` |
| F 修改數量 | `/cart` | `PATCH /cart/item/:id` | `cart.js`: 104–134；`index.js`: 19 | `CartActions.tsx`: 26–42、65–84 | `cart_items`、`products` |
| G 刪除品項 | `/cart` | `DELETE /cart/item/:id` | `cart.js`: 140–157；`index.js`: 19 | `CartActions.tsx`: 45–57、86–92 | `cart_items` |
| H 訂單列表 | `/orders` | `GET /order/order-list` | `heureux-backend/src/router/get-order-list.js`: 11–43；`index.js`: 18 | `heureux-frontend/src/app/orders/page.tsx`: 22–36、61–68、113–151 | `orders`、`order_items` |
| I 訂單詳細 | `/orders/[id]` | `GET /order/detail/:id` | `get-order-list.js`: 48–69；`index.js`: 18 | `heureux-frontend/src/app/orders/[id]/page.tsx`: 27–35、52–64、67–141；`orders/page.tsx`: 116–118 | `orders`、`order_items` |

**共用**

- **DB 連線**：`heureux-backend/src/utils/connect-mysql.js`: Line 1–18（`pool` 由各 router 引入）
- **後端 app 掛載**：`heureux-backend/index.js`: Line 17–19（`/product`、`/order`、`/cart`）
- **事件名**：`CART_UPDATED_EVENT = "cart-updated"` 定義於 `heureux-frontend/src/app/components/AddToCartButton.tsx`，由 AddToCartButton 與 CartActions 觸發，CartIconWithCount 監聽

---

*文件產出依據專案實際程式碼與行號，若日後程式變更請再對照更新。*
