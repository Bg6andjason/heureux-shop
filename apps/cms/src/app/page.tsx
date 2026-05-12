import Link from "next/link";

const navigationItems = ["商品管理", "分類管理", "訂單管理", "客戶管理", "素材管理", "商店設定"];

const metrics = [
  { label: "今日訂單", value: "0" },
  { label: "待處理商品", value: "0" },
  { label: "待出貨訂單", value: "0" },
  { label: "本月營收", value: "NT$0" },
];

export default function DashboardPage() {
  return (
    <main className="cms-shell">
      <aside className="cms-sidebar" aria-label="CMS navigation">
        <div className="brand">
          <span className="brand-mark">H</span>
          <div>
            <strong>Heureux Shop</strong>
            <small>CMS</small>
          </div>
        </div>

        <nav>
          {navigationItems.map((item) => (
            <Link className="nav-link" href="/" key={item}>
              {item}
            </Link>
          ))}
        </nav>
      </aside>

      <section className="cms-content">
        <header className="cms-header">
          <div>
            <p>後台總覽</p>
            <h1>Heureux Shop CMS</h1>
          </div>
          <Link className="nav-link" href="/login">
            登入頁
          </Link>
        </header>

        <section className="metric-grid" aria-label="CMS overview metrics">
          {metrics.map((metric) => (
            <article className="metric-card" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </article>
          ))}
        </section>

        <section className="workspace-panel">
          <div>
            <h2>CMS 應用程式已建立</h2>
            <p>這個 App Router 專案已納入 heureux-shop monorepo，後續會串接共用後端 API。</p>
          </div>
        </section>
      </section>
    </main>
  );
}
