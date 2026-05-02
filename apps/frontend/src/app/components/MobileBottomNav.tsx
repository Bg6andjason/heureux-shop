"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CartIconWithCount from "./CartIconWithCount";

interface MobileBottomNavProps {
  userId: number | null;
  accountHref: string;
}

export default function MobileBottomNav({
  userId,
  accountHref,
}: MobileBottomNavProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    if (!expanded) return;

    const focusId = window.setTimeout(() => inputRef.current?.focus(), 180);
    return () => window.clearTimeout(focusId);
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setExpanded(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expanded]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const next = new URLSearchParams(searchParams.toString());
    const trimmed = q.trim();
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");
    next.delete("page");

    const s = next.toString();
    router.push(s ? `/products?${s}` : "/products");
    setExpanded(false);
  }

  const leftIconClass = expanded
    ? "-translate-x-[120vw] opacity-0"
    : "translate-x-0 opacity-100";
  const rightIconClass = expanded
    ? "translate-x-[120vw] opacity-0"
    : "translate-x-0 opacity-100";
  const iconTransitionClass = expanded
    ? "duration-300 ease-out"
    : "delay-100 duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]";

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 overflow-hidden border-t border-primary/20 bg-black/90 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-md sm:hidden"
      aria-label="Mobile navigation"
    >
      <div className="relative grid grid-cols-4">
        <Link
          href="/products"
          className={`tap-target tap-target-subtle inline-flex min-h-14 items-center justify-center rounded-full transition-all hover:text-primary ${iconTransitionClass} ${leftIconClass}`}
          aria-label="Shop"
          tabIndex={expanded ? -1 : undefined}
        >
          <span className="material-symbols-outlined text-[26px]">storefront</span>
        </Link>

        <button
          type="button"
          onClick={() => setExpanded(true)}
          className={`tap-target tap-target-subtle inline-flex min-h-14 items-center justify-center rounded-full transition-all hover:text-primary ${iconTransitionClass} ${
            expanded ? "opacity-0" : "opacity-100"
          }`}
          aria-label="Search"
          aria-expanded={expanded}
          tabIndex={expanded ? -1 : undefined}
        >
          <span className="material-symbols-outlined text-[26px]">search</span>
        </button>

        <CartIconWithCount
          userId={userId}
          className={`mx-auto min-h-14 text-[26px] transition-all ${iconTransitionClass} ${rightIconClass}`}
          tabIndex={expanded ? -1 : undefined}
        />

        <Link
          href={accountHref}
          className={`tap-target tap-target-subtle inline-flex min-h-14 items-center justify-center rounded-full transition-all hover:text-primary ${iconTransitionClass} ${rightIconClass}`}
          aria-label="Account"
          tabIndex={expanded ? -1 : undefined}
        >
          <span className="material-symbols-outlined text-[26px]">person</span>
        </Link>

        <form
          onSubmit={onSubmit}
          className={`absolute inset-x-0 top-0 min-h-14 origin-[37.5%_50%] transition-all ${
            expanded
              ? "pointer-events-auto scale-x-100 opacity-100 duration-300 ease-out"
              : "pointer-events-none scale-x-0 opacity-0 duration-200 ease-in"
          }`}
          aria-hidden={!expanded}
        >
          <span className="material-symbols-outlined pointer-events-none absolute left-[calc(37.5%-13px)] top-1/2 z-10 -translate-y-1/2 text-[26px] text-primary">
            search
          </span>
          <input
            ref={inputRef}
            className={`h-14 w-full rounded-full border border-primary/35 bg-[#111] px-5 pl-[calc(37.5%+24px)] pr-12 text-sm font-bold tracking-widest text-white outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-primary ${
              expanded
                ? "delay-150 shadow-lg shadow-black/35"
                : "delay-0 shadow-none"
            }`}
            placeholder="SEARCH"
            type="text"
            aria-label="Search products"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            tabIndex={expanded ? undefined : -1}
          />
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="tap-target tap-target-subtle absolute right-2 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-primary"
            aria-label="Close search"
            tabIndex={expanded ? undefined : -1}
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </form>
      </div>
    </nav>
  );
}
