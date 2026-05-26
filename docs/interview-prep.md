# HEUREUX Shop 面試備戰稿

這份文件的目的不是讓你背稿，而是把這個 AI-assisted / vibe coding 專案轉成你能清楚說明、能被追問、能維護的作品集專案。

## 30 秒專案介紹

HEUREUX Shop 是一個服飾電商作品集專案，使用 Next.js App Router 建立前端，Express 建立 REST API，MySQL 作為資料庫。功能包含商品列表、商品詳情、搜尋與分類排序、會員註冊登入、收藏清單、購物車、結帳建立訂單、訂單列表與訂單詳情。

我在開發過程中大量使用 AI 輔助產生初版程式碼，但我負責需求拆解、視覺參考轉實作、整合前後端 API、檢查資料流、修正錯誤與驗證流程。現在我能說明主要架構、核心功能流程，以及專案中還需要強化的地方。

## 技術棧

- Frontend: Next.js 16、React 19、TypeScript、Tailwind CSS、App Router、Server Components、Server Actions
- Backend: Node.js、Express 5、MySQL、mysql2、bcrypt、jsonwebtoken、cors、dotenv
- Database: users、products、cart_items、customer_favorites、orders、order_items
- Repo structure: monorepo，前端在 `apps/frontend`，後端在 `apps/backend`，視覺參考和流程文件在 `docs`

## 可以主打的能力

1. Full-stack integration

   前端不是靜態畫面，而是透過 API 和 MySQL 資料互動。商品、收藏、購物車、訂單都由後端資料驅動。

2. Next.js App Router 實作

   商品列表和詳情頁使用 Server Component 在伺服端 fetch 資料；登入、註冊使用 Server Action 設定 HTTP-only cookie；購物車和收藏的按鈕則用 Client Component 處理即時互動。

3. 電商資料流

   使用者瀏覽商品，登入後可以收藏或加入購物車；購物車可修改數量、刪除品項；checkout 時由後端用 transaction 建立 order 和 order_items，然後清空 cart_items。

4. API 與資料庫設計

   後端把 products、cart、favorites、auth、orders 拆成不同 router。SQL 使用參數綁定避免基本 SQL injection，收藏表有 user_id + product_id unique key 避免重複收藏。

5. AI 協作能力

   可以誠實說這是 AI-assisted 專案，但重點放在你如何驗證、整合、理解、修正，而不是說「都是 AI 寫的」。

## 面試可以這樣說 AI 使用

不要說：

> 這個我都是用 AI 生成的，所以我不太確定。

改成：

> 這個專案我大量使用 AI 輔助開發。我的做法是先把需求、頁面狀態和 API 行為描述清楚，讓 AI 產生初版，再由我閱讀程式碼、測試流程、整合前後端、修正資料欄位和 UI 問題。這讓我開發速度變快，但我仍然需要對架構、資料流和最後結果負責。

如果被追問「那你自己寫了什麼？」可以回答：

> 我自己主要負責功能拆解、決定資料表和頁面流程、驗證 API 是否符合前端需求、處理登入狀態、購物車流程、收藏流程，以及把視覺參考整合成可操作的電商頁面。AI 幫我加速寫初版，但我會回頭逐段理解和整理。

## 核心流程一：商品列表

前端入口：`apps/frontend/src/app/products/page.tsx`

後端入口：`apps/backend/src/router/get-product-list.js`

流程：

1. 使用者進入 `/products`
2. Server Component 讀取 searchParams，例如 page、q、category、sort
3. 前端呼叫 `GET /api/products/categories` 取得分類
4. 前端呼叫 `GET /api/products?page=&q=&category=&sort=&user_id=` 取得商品列表
5. 後端根據搜尋、分類、排序組 SQL 條件
6. 若有 user_id，後端 LEFT JOIN customer_favorites 回傳 is_favorite
7. 前端用 ProductCard 顯示商品卡片

可以被追問：

- 為什麼 sort 不直接把 query string 塞進 SQL？
- 搜尋為什麼要 escape `%` 和 `_`？
- user_id 存在時為什麼要 join 收藏表？
- 現在 pagination 是 load more 形式，total count 沒有真正從 DB count 出來，這是可以改進的地方。

## 核心流程二：登入與會員狀態

前端入口：`apps/frontend/src/app/actions/auth.ts`

後端入口：`apps/backend/src/router/auth.js`

流程：

1. 使用者送出 login/register form
2. Server Action 呼叫 Express `/auth/login` 或 `/auth/register`
3. 後端註冊時用 bcrypt hash 密碼
4. 登入時用 bcrypt compare 驗證密碼
5. 驗證成功後後端簽 JWT
6. 前端把 auth_token、auth_user_id、auth_user_name、auth_user_email 存進 HTTP-only cookie
7. 其他 Server Component 透過 cookie 判斷是否登入

可以被追問：

- bcrypt 解決什麼問題？
- HTTP-only cookie 比 localStorage 安全在哪裡？
- 目前後端很多 API 仍然相信 user_id query/body，沒有驗證 JWT，這是下一步要補強的安全點。

## 核心流程三：加入購物車

前端入口：`apps/frontend/src/app/components/AddToCartButton.tsx`

後端入口：`apps/backend/src/router/cart.js`

流程：

1. 使用者在商品卡或商品詳情按 Add to Bag
2. Client Component 呼叫 `POST /cart/add`
3. body 包含 product_id、quantity、登入者 user_id
4. 後端確認商品存在
5. 如果 cart_items 已有同一 user + product，就更新 quantity
6. 如果沒有，就 insert 新 cart item
7. 後端用 stock 限制最大數量
8. 前端顯示 Added modal，並 dispatch `cart-updated` 事件更新 Navbar 數量

可以被追問：

- 為什麼同商品要 update 而不是 insert 多筆？
- stock cap 在後端做的好處是什麼？
- Client Component 和 Server Component 在這裡怎麼分工？

## 核心流程四：結帳與訂單

前端入口：`apps/frontend/src/app/cart/CheckoutButton.tsx`

後端入口：`apps/backend/src/router/cart.js` 的 `/checkout`

訂單查詢入口：`apps/backend/src/router/get-order-list.js`

流程：

1. 使用者在 `/cart` 按 Checkout
2. 前端呼叫 `POST /cart/checkout`
3. 後端讀取目前 cart_items join products
4. 後端開啟 MySQL transaction
5. 建立 orders
6. 將購物車品項寫入 order_items
7. 刪除該 user 的 cart_items
8. commit 後回傳 order_id
9. 前端導到 `/orders/[id]`

可以被追問：

- 為什麼 checkout 要用 transaction？
- 如果 insert order_items 成功但清空 cart 失敗會怎樣？
- 為什麼 order_items 要保存 price？避免商品日後改價影響歷史訂單。

## 目前最需要先修的問題

這些不是羞恥點，是你面試前的 checklist。修完就能很有底氣。

1. README 和部分文件中文亂碼

   面試官第一眼可能先看 README。現在 `README.md` 和 `docs/markdown/flows-mindmap.md` 都有亂碼，建議重寫成乾淨中文版或英文版。

2. 部分程式碼也有亂碼字串

   例如錯誤訊息、註解、頁面文字。這會影響專業度，也可能導致語法問題。

3. 資料庫 schema 和後端 checkout 可能不同步

   `schema.sql` 的 orders 欄位是 `total`，但 checkout insert 使用 `total_amount`。`schema.sql` 的 order_items 有 `name` 欄位，但 checkout insert 沒有寫 name。這可能會讓結帳流程在正式 DB 上失敗。

4. 後端驗證尚未完整

   前端有存 JWT，但 cart、favorites、orders 多數 API 仍靠 user_id query/body 判斷使用者。作品集可以接受是 MVP，但面試時要能主動說下一步會改成 middleware 驗證 JWT。

5. 測試與 build 狀態需要確認

   我嘗試跑 `npm run build` 和 `npm run lint`，第一次因 sandbox 權限在解析 `C:\Users\RYAN` 時失敗，第二次授權後命令逾時，沒有拿到明確結果。面試前應該在本機直接確認 build/lint 能過。

## 面試官可能問你什麼

### Q1. 你這個專案解決什麼問題？

這是一個完整電商流程練習，不只是切版。它從商品瀏覽、會員登入、收藏、購物車，到結帳和訂單查詢都有前後端資料串接，目標是展示我能把 UI、API、資料庫流程整合成可操作產品。

### Q2. 你為什麼選 Next.js？

因為商品列表、商品詳情、購物車這類頁面很適合用 App Router 的 Server Component 先在伺服端取得資料，減少前端 loading 狀態；登入和註冊則可以用 Server Action 處理 cookie。需要即時互動的地方，例如加入購物車和收藏，再用 Client Component。

### Q3. 你怎麼設計資料庫？

我把會員、商品、購物車、收藏、訂單拆成不同資料表。cart_items 記錄 user_id、product_id、quantity；customer_favorites 用 user_id 和 product_id 做 unique key；orders 和 order_items 分開，讓一張訂單可以包含多個商品。

### Q4. 這個專案哪裡最有挑戰？

最有挑戰的是前後端狀態一致。像加入購物車後，商品頁要顯示成功、Navbar 數量要更新、購物車頁也要重新抓資料；checkout 時還要確保訂單建立和購物車清空是同一個 transaction，避免資料一半成功一半失敗。

### Q5. 如果要繼續優化，你會做什麼？

我會先做四件事：

1. 修 README、錯誤訊息和文件亂碼
2. 對齊 schema 和後端 SQL，確保 checkout 穩定
3. 補 JWT middleware，讓後端不要信任前端傳來的 user_id
4. 補基本測試或至少 API smoke test，確保商品、登入、購物車、結帳流程不會壞

### Q6. 你用了 AI，那你真的懂嗎？

我會承認我用了 AI，而且用得很多。但我現在正在把專案反向整理成自己能維護的狀態。我能說明商品、登入、購物車、收藏、訂單這些流程，知道資料怎麼從前端到後端再到資料庫，也知道目前安全性和 schema 同步還有哪些問題。對我來說，AI 是加速工具，不是我逃避理解的理由。

## 面試前必練的 5 段程式

1. `apps/frontend/src/app/products/page.tsx`

   練習說明 searchParams、getCategories、getProducts、ProductCard render。

2. `apps/backend/src/router/get-product-list.js`

   練習說明搜尋、分類、排序、favorite join、SQL parameter binding。

3. `apps/frontend/src/app/actions/auth.ts`

   練習說明 Server Action、cookie、redirect、登入狀態。

4. `apps/backend/src/router/auth.js`

   練習說明 bcrypt、JWT、profile summary。

5. `apps/backend/src/router/cart.js`

   練習說明 add、list、patch、delete、checkout transaction。

## 你的備戰策略

第一階段：先修門面

- 重寫 README
- 修亂碼
- 確認 build/lint
- 確認 demo seed 能登入

第二階段：練主線

- 商品列表到商品詳情
- 登入後加入收藏
- 加入購物車
- 修改數量
- Checkout 建訂單

第三階段：準備誠實但有主導感的說法

- 這是 AI-assisted 專案
- 你負責需求、整合、驗證、修正
- 你知道目前限制
- 你能說出下一步怎麼補強

## 一句話心法

面試官不一定在乎你是不是每一行都手刻，但一定會在乎你能不能對作品負責。你要把焦點從「我是不是 vibe coding」移到「我能不能解釋、驗證、修正、維護這個系統」。
