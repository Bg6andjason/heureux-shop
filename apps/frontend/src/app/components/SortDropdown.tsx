"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type SortKey = "newest" | "oldest" | "price_asc" | "price_desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price_asc", label: "Price ↑" },
  { value: "price_desc", label: "Price ↓" },
];

export default function SortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const current = useMemo(() => {
    const raw = searchParams.get("sort");
    const allowed = new Set(SORT_OPTIONS.map((o) => o.value));
    if (raw && allowed.has(raw as SortKey)) return raw as SortKey;
    return "newest";
  }, [searchParams]);

  const currentLabel = useMemo(() => {
    return SORT_OPTIONS.find((o) => o.value === current)?.label ?? "Newest";
  }, [current]);

  function onChange(nextSort: SortKey) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("sort", nextSort);
    next.delete("page"); // 切換排序回到第一頁
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
    <div ref={rootRef} className="relative w-[min(14.5rem,100%)]">
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
          aria-label="Sort by"
          className="w-full bg-black border-x-2 border-b-2 border-primary z-10 mt-[-2px]"
        >
          {SORT_OPTIONS.map((o, idx) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`w-full text-left flex items-center justify-between px-5 py-3 hover:bg-white/5 cursor-pointer group transition-colors ${idx !== SORT_OPTIONS.length - 1 ? "border-b border-white/10" : ""}`}
              role="option"
              aria-selected={current === o.value}
            >
              <span className="font-display font-black text-white group-hover:translate-x-2 transition-transform uppercase tracking-widest text-lg leading-none">
                {o.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
