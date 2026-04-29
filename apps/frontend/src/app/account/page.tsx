import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthProfile } from "@/app/actions/auth";

export const metadata = {
  title: "Member Center | HEUREUX",
  description: "Manage your HEUREUX account, orders, rewards, and settings.",
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

function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 border px-3 py-1 text-xs font-bold uppercase tracking-widest ${
        active
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-white/10 bg-white/5 text-slate-400"
      }`}
    >
      <span className="material-symbols-outlined text-[16px]">
        {active ? "check_circle" : "radio_button_unchecked"}
      </span>
      {label}
    </span>
  );
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
            管理你的個人資料、訂單、優惠、收件資訊與帳號安全。
          </p>
        </div>
        <div className="border border-primary/20 bg-primary/10 p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Member Level
          </p>
          <p className="mt-2 font-display text-5xl font-bold text-white">
            {profile.member_level}
          </p>
          <p className="mt-3 text-sm text-slate-400">
            加入日期 {formatDate(profile.created_at)}
          </p>
        </div>
      </section>

      <section className="mb-8 grid gap-3 md:grid-cols-4">
        {[
          ["receipt_long", "訂單", profile.order_count],
          ["payments", "累積消費", formatCurrency(profile.total_spent)],
          ["stars", "紅利點數", profile.points],
          ["shopping_bag", "購物車商品", profile.cart_count],
        ].map(([icon, label, value]) => (
          <div key={label} className="border border-white/10 bg-white/[0.03] p-5">
            <span className="material-symbols-outlined text-primary">{icon}</span>
            <p className="mt-4 font-display text-3xl font-bold text-white">
              {value}
            </p>
            <p className="text-sm uppercase tracking-widest text-slate-500">
              {label}
            </p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
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

        <InfoPanel icon="verified_user" title="帳號狀態">
          <div className="flex flex-wrap gap-3">
            <StatusBadge active={profile.email_verified} label="Email 已驗證" />
            <StatusBadge active={profile.phone_verified} label="手機未驗證" />
            <StatusBadge active label="密碼登入啟用" />
          </div>
          <Link
            href="#settings"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary hover:underline"
          >
            帳號設定
            <span className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          </Link>
        </InfoPanel>

        <InfoPanel id="rewards" icon="sell" title="優惠與點數">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-white/5 p-4">
              <p className="text-sm text-slate-500">可用優惠券</p>
              <p className="mt-2 font-display text-4xl font-bold text-white">
                {profile.coupons}
              </p>
            </div>
            <div className="bg-white/5 p-4">
              <p className="text-sm text-slate-500">紅利點數</p>
              <p className="mt-2 font-display text-4xl font-bold text-white">
                {profile.points}
              </p>
            </div>
          </div>
        </InfoPanel>

        <InfoPanel icon="local_shipping" title="收件資訊">
          <p className="text-sm text-slate-400">
            {profile.default_address ?? "尚未建立預設收件地址。"}
          </p>
          <button className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
            <span className="material-symbols-outlined text-[18px]">add</span>
            新增地址
          </button>
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
            已收藏 {profile.wishlist_count} 件商品。收藏功能資料表尚未建立，這裡已保留入口。
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

        <InfoPanel icon="credit_card" title="付款方式">
          <p className="text-sm text-slate-400">
            已儲存 {profile.payment_methods} 組付款方式。
          </p>
          <button className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
            <span className="material-symbols-outlined text-[18px]">
              add_card
            </span>
            新增付款方式
          </button>
        </InfoPanel>

        <InfoPanel id="settings" icon="settings" title="安全與通知">
          <div className="grid gap-3 text-sm text-slate-400">
            <div className="flex items-center justify-between gap-4 bg-white/5 p-4">
              <span>修改密碼</span>
              <span className="material-symbols-outlined text-primary">
                chevron_right
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 bg-white/5 p-4">
              <span>Email 訂單通知</span>
              <StatusBadge active label="啟用" />
            </div>
            <div className="flex items-center justify-between gap-4 bg-white/5 p-4">
              <span>行銷優惠通知</span>
              <StatusBadge active={false} label="未啟用" />
            </div>
          </div>
        </InfoPanel>

        <InfoPanel icon="support_agent" title="客服入口">
          <p className="text-sm text-slate-400">
            需要退換貨、訂單協助或商品諮詢時，可以從這裡進入客服流程。
          </p>
          <Link
            href="/orders"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary hover:underline"
          >
            從訂單尋求協助
            <span className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          </Link>
        </InfoPanel>
      </div>
    </main>
  );
}
