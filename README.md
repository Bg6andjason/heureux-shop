# HEUREUX Shop

HEUREUX Shop 是一個以選物品牌為主題的 full-stack 電商作品集專案。
專案涵蓋完整的購物流程：會員註冊與登入、商品瀏覽、搜尋、分類篩選、
排序、收藏清單、購物車管理、結帳，以及訂單紀錄查詢。

這不只是單純的切版作品。專案包含 Next.js 前台商店、Next.js CMS 管理後台、
Express API server、MySQL 資料庫設計、依使用者區分的購物資料，以及完整串接
主要購物流程與後台管理流程的 API 整合。

## 專案重點

- 採用 monorepo 架構，前端與後端分離管理。
- 建立 CMS 管理後台，可管理商品、訂單、會員、媒體素材與系統狀態。
- 商品列表與商品詳情頁皆串接 MySQL 資料。
- 實作搜尋、分類篩選、排序，以及 pagination/load-more 行為。
- 會員註冊與登入流程，後端使用 bcrypt 處理密碼雜湊並簽發 JWT。
- 前台 Next.js 使用 HTTP-only cookies 保存會員登入狀態；CMS 管理後台使用 browser sessionStorage 保存 Admin JWT。
- 支援依使用者區分的購物車、收藏清單、會員資訊摘要與訂單紀錄。
- 購物車支援數量調整、庫存上限限制、商品移除，以及 Navbar 數量即時更新。
- 結帳流程會將目前購物車內容建立為訂單紀錄。
- 資料庫 schema 包含 users、products、cart items、favorites、orders 與 order items。
- `docs/` 目錄保留視覺參考、流程筆記與開發規劃文件。

## 技術棧

### 前端

- Next.js
- React
- TypeScript
- Tailwind CSS
- Next.js App Router
- Server Components 與 Server Actions

### 後端

- Node.js
- Express
- MySQL
- mysql2
- bcrypt
- jsonwebtoken
- cors
- dotenv

## 專案結構

```text
heureux-shop/
+-- apps/
|   +-- frontend/        # Next.js 前端商店
|   +-- cms/             # Next.js CMS 管理後台
|   +-- backend/         # Express API server
+-- docs/                # UI 參考、流程筆記、截圖與規劃文件
+-- package.json         # workspace scripts
+-- README.md
```

## 主要功能

### 商店前台

- 具品牌風格的首頁與動態視覺效果。
- 商品列表包含商品卡片、圖片、價格、分類與收藏狀態。
- 商品詳情頁包含庫存資訊與加入購物車功能。
- 支援分類篩選、關鍵字搜尋、排序與 load-more 導覽。

### 會員系統

- 註冊與登入 API。
- 使用 bcrypt 儲存密碼雜湊。
- 後端簽發 JWT。
- 前台 Next.js 將會員 JWT 保存於 HTTP-only cookies，降低 token 被前端 JavaScript 讀取的風險。
- CMS 管理後台將 Admin JWT 保存於 browser sessionStorage，並在管理 API 請求中以 `Authorization: Bearer <token>` 帶出。
- 會員頁顯示個人資料與購物摘要。

### 收藏清單

- 加入或移除收藏商品。
- 依使用者顯示收藏清單。
- 商品列表可顯示該商品是否已被收藏。

### 購物車與結帳

- 將商品加入購物車。
- 調整商品數量，並依庫存限制最大數量。
- 移除購物車商品。
- 購物車變更後，Navbar 的購物車數量會即時更新。
- 結帳時會依目前購物車內容建立訂單，並清空購物車。

### 訂單

- 訂單列表頁。
- 訂單狀態篩選。
- 訂單詳情頁，顯示購買商品與總金額。

### CMS 管理後台

- 管理員登入，使用後端 Admin JWT 驗證。
- 營運總覽頁，顯示商品、訂單、會員與庫存摘要。
- 商品管理支援列表、新增、編輯、刪除與圖片網址設定。
- 訂單管理支援訂單列表、金額摘要與狀態更新。
- 會員管理支援會員列表、訂單數、消費金額、購物車與收藏摘要。
- 媒體管理支援商品圖片素材檢視與更新。
- 系統設定頁顯示 API base URL、後端 health check 與模組狀態。

## 資料庫

SQL 檔案位置：

```text
apps/backend/src/db/schema.sql
apps/backend/src/db/seed.sql
```

主要資料表：

- `users`
- `admin_users`
- `products`
- `cart_items`
- `customer_favorites`
- `orders`
- `order_items`

seed 檔提供的 demo 帳號：

```text
Email: demo@example.com
Password: demo123
```

CMS demo 管理員帳號：

```text
Email: admin@heureux.local
Password: heureux-admin
```

## 環境變數

在 backend app 建立 `.env`：

```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_password
DB_NAME=heureux_shop
CORS_ORIGIN=http://localhost:3000,http://localhost:3002
JWT_SECRET=replace_with_your_secret
```

在 frontend app 建立 `.env.local`：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

在 cms app 建立 `.env.local`：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## 開始使用

從專案根目錄安裝 dependencies：

```bash
npm install
```

建立並匯入資料庫：

```bash
mysql -u root -p heureux_shop < apps/backend/src/db/schema.sql
mysql -u root -p heureux_shop < apps/backend/src/db/seed.sql
```

啟動後端：

```bash
npm run dev:backend
```

另開一個 terminal 啟動前端：

```bash
npm run dev:frontend
```

如需檢視 CMS 管理後台，另開一個 terminal 啟動 CMS：

```bash
npm run dev:cms
```

開啟網站：

```text
http://localhost:3000
```

開啟 CMS：

```text
http://localhost:3002
```

## 可用指令

從專案根目錄執行：

```bash
npm run dev:frontend   # 啟動 Next.js 前端
npm run dev:cms        # 啟動 Next.js CMS 管理後台
npm run dev:backend    # 啟動 Express 後端
npm run build          # 建置前端
npm run build:cms      # 建置 CMS
npm run lint           # 執行前端 lint
npm run lint:cms       # 執行 CMS lint
```

## 這個專案展示的能力

這個專案展示我能從規劃到實作完成一個 full-stack web application。
我設計資料模型、建立 REST APIs、將前台商店與 CMS 後台串接真實後端資料、
處理會員與管理員登入狀態，並實作接近真實電商產品的購物與營運管理流程。

此專案也展示我不只完成程式碼，還會整理開發過程中的視覺參考、流程筆記與
實作規劃。相關文件保留在 `docs/` 目錄中，方便理解專案的設計與開發脈絡。

## 備註

部分較早期的規劃文件可能因為文件匯出或編碼問題而出現亂碼。目前根目錄的
README 是主要專案介紹。
