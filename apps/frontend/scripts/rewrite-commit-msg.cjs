const fs = require("fs");

let msg = fs.readFileSync(0, "utf8");

const replacements = [
  ["feat(home): redesign landing page", "feat(home): 重新設計首頁著陸頁"],
  ["feat(theme): apply global styles and app layout", "feat(theme): 套用全域樣式與根版型"],
  ["feat(orders): add orders list and detail pages", "feat(orders): 新增訂單列表與明細頁"],
  ["feat(cart): add cart and checkout UI", "feat(cart): 新增購物車與結帳介面"],
  ["feat(products): add product listing and detail pages", "feat(products): 新增商品列表與商品詳情頁"],
  ["feat(auth): add login and registration pages", "feat(auth): 新增登入與註冊頁"],
  ["feat(actions): add auth and cart server actions", "feat(actions): 新增登入與購物車的伺服器 actions"],
  ["feat(vision): add ASCII and terminal effects", "feat(vision): 新增 ASCII 與終端機視覺特效"],
  ["feat(components): add shared storefront UI components", "feat(components): 新增商城共用 UI 元件"],
  ["chore(next): allow external images", "chore(next): 允許外部圖片來源"],
  ["chore(deps): add three/ogl", "chore(deps): 加入 three/ogl 依賴"],
  ["chore(assets): update public assets", "chore(assets): 更新 public 靜態資產"],
];

for (const [from, to] of replacements) {
  msg = msg.replaceAll(from, to);
}

process.stdout.write(msg);

