import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getAuthProfile } from "@/app/actions/auth";
import { getFavoriteProducts } from "@/app/actions/favorites";

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
  const favorites = await getFavoriteProducts();

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
          {favorites.length === 0 ? (
            <>
              <p className="text-sm text-slate-400">
                目前尚未收藏商品，逛到喜歡的品項可以直接加入清單。
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
            </>
          ) : (
            <div className="grid gap-4">
              <p className="text-sm text-slate-400">
                已收藏 {profile.wishlist_count} 件商品。
              </p>
              <ul
                className="relative grid gap-3 overflow-hidden"
                style={favorites.length > 1 ? { maxHeight: "144px" } : undefined}
              >
                {favorites.slice(0, favorites.length > 1 ? 2 : 1).map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/products/${item.product_id}`}
                      className="flex items-center gap-4 border border-white/10 bg-white/[0.03] p-3 transition-colors hover:border-primary/50"
                    >
                      <div className="relative size-16 flex-shrink-0 overflow-hidden bg-[#262626]">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-500">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold uppercase tracking-wide text-white">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          NT$ {item.price.toLocaleString("zh-TW")}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-primary">
                        arrow_forward
                      </span>
                    </Link>
                  </li>
                ))}
                {favorites.length > 1 && (
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[#151515]"
                    aria-hidden="true"
                  />
                )}
              </ul>
              <Link
                href="/wishlist"
                className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary hover:underline"
              >
                查看收藏
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </Link>
            </div>
          )}
        </InfoPanel>
      </div>
    </main>
  );
}
