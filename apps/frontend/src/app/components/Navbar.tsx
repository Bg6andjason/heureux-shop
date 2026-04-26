import Link from "next/link";
import CartIconWithCount from "./CartIconWithCount";
import {
  getAuthUserId,
  getAuthDisplayName,
  logoutAction,
} from "@/app/actions/auth";
import ProductSearchBar from "./ProductSearchBar";

export default async function Navbar() {
  const userId = await getAuthUserId();
  const isLoggedIn = userId !== null;
  const displayName = await getAuthDisplayName();
  const label = isLoggedIn ? displayName || "Account" : "";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-black/80 backdrop-blur-md px-6 lg:px-20 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-12">
          <Link
            href="/"
            className="flex items-center gap-2 group cursor-pointer"
          >
            <span className="material-symbols-outlined text-primary text-3xl">
              Nest_Farsight_Seasonal
            </span>
            <h1 className="text-3xl font-black tracking-normal text-slate-100 font-display">
              HEUREUX
            </h1>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-8">
            <Link
              className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors"
              href="/products"
            >
              Shop
            </Link>
            <Link
              className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors"
              href="/orders"
            >
              orders
            </Link>
          </nav>
          <div className="relative hidden sm:block">
            <ProductSearchBar className="relative" />
          </div>
          <CartIconWithCount userId={userId} />
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400 max-w-[120px] truncate">
                {label}
              </span>
              <form action={logoutAction} className="inline">
                <button
                  type="submit"
                  className="hover:text-primary transition-colors"
                  aria-label="登出"
                >
                  <span className="material-symbols-outlined">person</span>
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="hover:text-primary transition-colors"
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
