# Heureux Shop CMS

Heureux Shop CMS 是管理員使用的後台介面，負責管理商品、分類、訂單、客戶與商店設定。

## 開發指令

請在 monorepo 根目錄執行：

```bash
npm install
npm run dev:cms
npm run build:cms
npm run lint:cms
```

## API 設定

CMS 會連向 `apps/backend` 提供的 Express API。

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```
