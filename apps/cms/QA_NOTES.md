# CMS QA 紀錄

日期：2026-05-20
專案路徑：`C:\Users\RYAN\Documents\heureux\heureux-shop\apps\cms`
測試工具：Codex in-app Browser Playwright API
CMS URL：

- `http://localhost:3002`
- `http://127.0.0.1:3002`

## 測試範圍

- 開啟 CMS 登入頁。
- 使用測試帳密登入：
  - Email: `admin@heureux.local`
  - 密碼：`heureux-admin`
- 測試密碼顯示按鈕是否存在。
- 走訪已登入模組路由：
  - `/`
  - `/products`
  - `/categories`
  - `/orders`
  - `/customers`
  - `/media`
  - `/settings`
- 測試未知路由 `/not-a-route`。
- 測試登出。
- 測試未登入進入 `/products` 是否導回 `/login`。
- 檢查 browser console errors。
- 以 PowerShell 直接 POST 後端登入 API 驗證 API 可用性。

## 發現問題

### P1 - 使用 `127.0.0.1:3002` 開 CMS 時，登入會失敗

狀態：可重現

重現步驟：

1. 開啟 `http://127.0.0.1:3002/login`。
2. 使用 `admin@heureux.local / heureux-admin` 登入。

實際結果：

- 仍停留在 `/login`。
- 頁面顯示：`無法連線到後端管理員登入 API。`
- Browser console errors 為 0。

對照結果：

- 直接 POST `http://127.0.0.1:3001/auth/admin/login` 成功。
- 使用 `http://localhost:3002/login` 登入成功，登入後進入 `/`。

推測原因：

- CMS 前端預設 API base URL 是 `http://localhost:3001`。
- 當 CMS 使用 `127.0.0.1:3002` 開啟時，瀏覽器端 request 可能受到 host / origin 差異影響。

可能修復方向：

- 將 `NEXT_PUBLIC_API_BASE_URL` 與 CMS 開啟 host 對齊。
- 或改成相對 API proxy / rewrite，避免 local host name 不一致。
- 或確認 backend CORS / browser local network policy 是否需要允許 `http://127.0.0.1:3002`。

### P2 - 密碼欄位的 accessible name 混入顯示密碼按鈕文字

狀態：可重現

實際結果：

- DOM snapshot 顯示密碼欄位為：`textbox "密碼 顯示密碼"`。
- 預期應為：`textbox "密碼"`。

影響：

- Playwright 使用 `getByLabel("密碼", { exact: true })` 無法穩定定位。
- 螢幕閱讀器可能會把欄位名稱讀成「密碼 顯示密碼」。

可能修復方向：

- 不要讓密碼 input 與顯示密碼按鈕共同被同一個 `<label>` 包住。
- 改用 `label htmlFor="admin-password"` 對應 input，並把切換按鈕放在 label 外或獨立於 label text 計算。

## 通過項目

- `http://localhost:3002/login` 可正常載入。
- `http://localhost:3002/login` 使用正確帳密可登入。
- Dashboard `/` 可載入。
- `/products` 可載入，商品列表、新增表單、編輯與刪除按鈕可見。
- `/categories` 可載入。
- `/orders` 可載入。
- `/customers` 可載入。
- `/media` 可載入，商品圖片輸入與儲存按鈕可見。
- `/settings` 可載入，後端連線狀態顯示 Online。
- `/not-a-route` 會顯示 Next.js 404，不會出現開發者錯誤頁。
- 登出按鈕存在且可登出。
- 登出後會回到 `/login`。
- 未登入直接進入 `/products` 會導回 `/login`。
- Browser console errors：0。

## 測試備註

- 後端根路徑 `http://127.0.0.1:3001/` 回應 `Cannot GET /`，但這不是本次缺陷，因為登入 API `POST /auth/admin/login` 可正常回傳 token。
- 開發模式下畫面會出現 `Open Next.js Dev Tools` 按鈕，屬於 Next dev server 行為，未列為 CMS 缺陷。

## Playwright 複測紀錄

日期：2026-05-21
測試 URL：`http://localhost:3002`
後端健康檢查：`http://127.0.0.1:3001/health` 回傳 `{ "ok": true }`

### 複測結果摘要

- `PASS` 載入登入頁：`/login`
- `FAIL` 密碼欄位 accessible name 仍為 `密碼 顯示密碼`，預期應為 `密碼`。
- `PASS` 顯示密碼按鈕唯一。
- `PASS` 顯示 / 隱藏密碼切換。
- `PASS` 使用 `#admin-password` 可定位密碼 input。
- `PASS` 登入按鈕唯一。
- `PASS` 使用 `admin@heureux.local / heureux-admin` 可登入並進入 `/`。
- `PASS` `/` dashboard 可載入。
- `PASS` `/products` 可載入。
- `PASS` `/categories` 可載入。
- `PASS` `/orders` 可載入。
- `PASS` `/customers` 可載入。
- `PASS` `/media` 可載入。
- `PASS` `/settings` 可載入，後端連線狀態顯示 Online。
- `PASS` `/not-a-route` 顯示 Next.js 404。
- `PASS` 登出按鈕唯一。
- `PASS` 登出後回到 `/login`。
- `PASS` 未登入進入 `/products` 會導回 `/login`。
- `PASS` Browser console errors：0。

### 複測結論

- CMS 主要登入、路由、登出與保護路由流程正常。
- 仍需修正密碼欄位 label 結構，避免顯示密碼按鈕文字併入 input accessible name。
