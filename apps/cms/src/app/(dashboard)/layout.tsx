import Link from "next/link";

const navigationItems = [
  { href: "/", label: "總覽" },
  { href: "/products", label: "商品" },
  { href: "/categories", label: "分類" },
  { href: "/orders", label: "訂單" },
  { href: "/customers", label: "會員" },
  { href: "/media", label: "媒體" },
  { href: "/settings", label: "設定" },
];

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="cms-shell">
      <aside className="cms-sidebar" aria-label="CMS 導覽">
        <Link className="brand" href="/">
          <span className="brand-mark">H</span>
          <span>
            <strong>Heureux Shop</strong>
            <small>CMS</small>
          </span>
        </Link>

        <nav className="cms-nav" aria-label="主要功能">
          {navigationItems.map((item) => (
            <Link className="nav-link" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <section className="cms-content">
        <header className="cms-header">
          <div>
            <p>後台管理</p>
            <h1>Heureux Shop CMS</h1>
          </div>
          <Link className="header-action" href="/login">
            登入
          </Link>
        </header>

        {children}
      </section>
    </main>
  );
}
