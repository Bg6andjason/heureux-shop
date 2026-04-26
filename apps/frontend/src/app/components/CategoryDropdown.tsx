"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  categories: string[];
};

export default function CategoryDropdown({ categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const current = useMemo(
    () => searchParams.get("category") ?? "",
    [searchParams],
  );

  const currentLabel = useMemo(() => {
    if (!current) return "ALL CATEGORIES";
    return current;
  }, [current]);

  function onChange(nextCategory: string) {
    const next = new URLSearchParams(searchParams.toString());

    if (nextCategory) next.set("category", nextCategory);
    else next.delete("category");

    next.delete("page"); // 切換分類回到第一頁
    const s = next.toString();
    router.push(s ? `/products?${s}` : "/products");
  }

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!open) return;
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative w-[min(18rem,100%)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-transparent border-2 border-primary"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="font-display font-black text-primary uppercase tracking-widest text-lg leading-none">
          {currentLabel}
        </span>
        <span
          className={`material-symbols-outlined text-primary transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          expand_more
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Category"
          className="w-full bg-black border-x-2 border-b-2 border-primary z-10 mt-[-2px]"
        >
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="w-full text-left flex items-center justify-between px-5 py-3 border-b border-white/10 hover:bg-white/5 cursor-pointer group transition-colors"
            role="option"
            aria-selected={!current}
          >
            <span className="font-display text-white group-hover:translate-x-2 transition-transform uppercase tracking-widest text-lg leading-none">
              ALL CATEGORIES
            </span>
          </button>

          {categories.map((cat, idx) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                onChange(cat);
                setOpen(false);
              }}
              className={`w-full text-left flex items-center justify-between px-5 py-3 hover:bg-white/5 cursor-pointer group transition-colors ${idx !== categories.length - 1 ? "border-b border-white/10" : ""}`}
              role="option"
              aria-selected={current === cat}
            >
              <span className="font-display text-white group-hover:translate-x-2 transition-transform uppercase tracking-widest text-lg leading-none">
                {cat}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
