import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthProfile } from "@/app/actions/auth";

export const metadata = {
  title: "Member Center | HEUREUX",
  description: "Manage your HEUREUX account and orders.",
};

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return value;
  }
}

function formatCurrency(value: number): string {
  return `NT$ ${value.toLocaleString("zh-TW")}`;
}

function InfoPanel({
  id,
  icon,
  title,
  children,
}: {
  id?: string;
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border border-white/10 bg-white/[0.03] p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">{icon}</span>
        <h2 className="font-display text-2xl font-bold tracking-normal text-white">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export default async function AccountPage() {
  const profile = await getAuthProfile();
  if (!profile) redirect("/login?from=/account");

  const displayName = profile.name || "HEUREUX Member";

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12 md:px-20">
      <nav className="mb-8 flex items-center gap-2 text-sm text-slate-500 dark:text-primary/60">
        <Link className="transition-colors hover:text-primary" href="/">
          Home
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-100">Account</span>
      </nav>

      <section className="mb-10 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
            Member Center
          </p>
          <h1 className="font-display text-5xl font-bold uppercase tracking-normal text-white md:text-7xl">
            {displayName}
          </h1>
          <p className="mt-4 max-w-2xl text-slate-400">
            管理你的個人資料、訂單紀錄與收藏清單。
          </p>
        </div>
        <div className="border border-primary/20 bg-primary/10 p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Joined
          </p>
          <p className="mt-2 font-display text-5xl font-bold text-white">
            {formatDate(profile.created_at)}
          </p>
          <p className="mt-3 text-sm text-slate-400">會員加入日期</p>
        </div>
      </section>

      <section className="mb-8 grid gap-3 md:grid-cols-3">
        {[
          ["receipt_long", "訂單", profile.order_count],
          ["payments", "累積消費", formatCurrency(profile.total_spent)],
          ["shopping_bag", "購物車商品", profile.cart_count],
        ].map(([icon, label, value]) => (
          <div
            key={label}
            className="border border-white/10 bg-white/[0.03] p-5"
          >
            <span className="material-symbols-outlined text-primary">
              {icon}
            </span>
            <p className="mt-4 font-display text-3xl font-bold text-white">
              {value}
            </p>
            <p className="text-sm uppercase tracking-widest text-slate-500">
              {label}
            </p>
          </div>
        ))}
      </section>

      <div className="grid gap-3 lg:grid-cols-3">
        <InfoPanel icon="badge" title="個人資料">
          <dl className="grid gap-4 text-sm">
            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
              <dt className="text-slate-500">姓名</dt>
              <dd className="text-right text-slate-100">{displayName}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
              <dt className="text-slate-500">Email</dt>
              <dd className="min-w-0 truncate text-right text-slate-100">
                {profile.email}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">會員編號</dt>
              <dd className="text-right text-slate-100">#{profile.id}</dd>
            </div>
          </dl>
        </InfoPanel>

        <InfoPanel icon="receipt_long" title="訂單紀錄">
          <p className="text-sm text-slate-400">
            目前共有 {profile.order_count} 筆訂單，累積消費{" "}
            {formatCurrency(profile.total_spent)}。
          </p>
          <Link
            href="/orders"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary hover:underline"
          >
            查看我的訂單
            <span className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          </Link>
        </InfoPanel>

        <InfoPanel id="wishlist" icon="favorite" title="收藏清單">
          <p className="text-sm text-slate-400">
            已收藏 {profile.wishlist_count}{" "}
            件商品。收藏功能資料表尚未建立，這裡已保留入口。
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary hover:underline"
          >
            前往選購
            <span className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          </Link>
        </InfoPanel>
      </div>
    </main>
  );
}
