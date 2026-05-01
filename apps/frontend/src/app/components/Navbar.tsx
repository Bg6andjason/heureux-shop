import Link from "next/link";
import CartIconWithCount from "./CartIconWithCount";
import ProductSearchBar from "./ProductSearchBar";
import UserAccountMenu from "./UserAccountMenu";
import {
  getAuthDisplayName,
  getAuthEmail,
  getAuthProfile,
  getAuthUserId,
  logoutAction,
} from "@/app/actions/auth";

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
          <Link
            href="/"
            className="tap-target tap-target-subtle group -mx-2 flex cursor-pointer items-center gap-2 rounded-full px-2"
          >
            <span className="material-symbols-outlined text-3xl text-primary">
              Nest_Farsight_Seasonal
            </span>
            <h1 className="font-display text-3xl font-black tracking-normal text-slate-100">
              HEUREUX
            </h1>
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative hidden sm:block">
            <ProductSearchBar className="relative" />
          </div>
          <CartIconWithCount userId={userId} />

          {isLoggedIn ? (
            <UserAccountMenu
              label={label}
              accountEmail={accountEmail}
              orderCount={profile?.order_count ?? 0}
              cartCount={profile?.cart_count ?? 0}
              logoutAction={logoutAction}
            />
          ) : (
            <Link
              href="/login"
              className="tap-target tap-target-subtle inline-flex size-11 items-center justify-center rounded-full transition-colors hover:text-primary"
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
