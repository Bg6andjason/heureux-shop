import Link from "next/link";
import CartIconWithCount from "./CartIconWithCount";
import {
  getAuthDisplayName,
  getAuthEmail,
  getAuthProfile,
  getAuthUserId,
  logoutAction,
} from "@/app/actions/auth";
import ProductSearchBar from "./ProductSearchBar";

export default async function Navbar() {
  const userId = await getAuthUserId();
  const isLoggedIn = userId !== null;
  const displayName = await getAuthDisplayName();
  const email = await getAuthEmail();
  const profile = isLoggedIn ? await getAuthProfile() : null;
  const label = isLoggedIn ? displayName || profile?.name || "Account" : "";
  const accountEmail = email || profile?.email || "";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-black/80 px-6 py-4 backdrop-blur-md lg:px-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="group flex cursor-pointer items-center gap-2">
            <span className="material-symbols-outlined text-3xl text-primary">
              Nest_Farsight_Seasonal
            </span>
            <h1 className="font-display text-3xl font-black tracking-normal text-slate-100">
              HEUREUX
            </h1>
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              className="text-sm font-bold uppercase tracking-widest transition-colors hover:text-primary"
              href="/products"
            >
              Shop
            </Link>
            <Link
              className="text-sm font-bold uppercase tracking-widest transition-colors hover:text-primary"
              href="/orders"
            >
              Orders
            </Link>
          </nav>
          <div className="relative hidden sm:block">
            <ProductSearchBar className="relative" />
          </div>
          <CartIconWithCount userId={userId} />

          {isLoggedIn ? (
            <div className="group relative flex items-center gap-2">
              <span className="max-w-[120px] truncate text-sm text-slate-400">
                {label}
              </span>
              <button
                type="button"
                className="transition-colors hover:text-primary"
                aria-label="開啟會員選單"
              >
                <span className="material-symbols-outlined">person</span>
              </button>
              <div className="invisible absolute right-0 top-full z-50 mt-3 w-80 translate-y-2 border border-primary/20 bg-[#111] p-4 opacity-0 shadow-2xl shadow-black/40 transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <div className="border-b border-white/10 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold uppercase tracking-widest text-white">
                        {label}
                      </p>
                      {accountEmail && (
                        <p className="mt-1 truncate text-xs text-slate-400">
                          {accountEmail}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 border border-primary/30 px-2 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                      {profile?.member_level ?? "Member"}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/5 p-3">
                      <p className="font-display text-lg font-bold text-white">
                        {profile?.points ?? 0}
                      </p>
                      <p className="text-[11px] uppercase tracking-widest text-slate-500">
                        Points
                      </p>
                    </div>
                    <div className="bg-white/5 p-3">
                      <p className="font-display text-lg font-bold text-white">
                        {profile?.coupons ?? 0}
                      </p>
                      <p className="text-[11px] uppercase tracking-widest text-slate-500">
                        Coupons
                      </p>
                    </div>
                    <div className="bg-white/5 p-3">
                      <p className="font-display text-lg font-bold text-white">
                        {profile?.order_count ?? 0}
                      </p>
                      <p className="text-[11px] uppercase tracking-widest text-slate-500">
                        Orders
                      </p>
                    </div>
                  </div>
                </div>
                <nav className="grid py-2 text-sm">
                  {[
                    ["會員中心", "/account", "manage_accounts"],
                    ["我的訂單", "/orders", "receipt_long"],
                    ["收藏清單", "/account#wishlist", "favorite"],
                    ["優惠券", "/account#rewards", "sell"],
                    ["帳號設定", "/account#settings", "settings"],
                  ].map(([text, href, icon]) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-3 px-2 py-3 text-slate-300 transition-colors hover:bg-white/5 hover:text-primary"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {icon}
                      </span>
                      <span>{text}</span>
                    </Link>
                  ))}
                </nav>
                <form action={logoutAction} className="border-t border-white/10 pt-2">
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 px-2 py-3 text-left text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      logout
                    </span>
                    <span>登出</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="transition-colors hover:text-primary"
              aria-label="登入"
            >
              <span className="material-symbols-outlined">person</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
