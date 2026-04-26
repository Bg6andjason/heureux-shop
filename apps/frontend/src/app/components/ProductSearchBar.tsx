"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type Props = {
  className?: string;
};

export default function ProductSearchBar({ className }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQ = useMemo(() => searchParams.get("q") ?? "", [searchParams]);
  const [q, setQ] = useState(initialQ);

  function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const next = new URLSearchParams(searchParams.toString());
    const trimmed = q.trim();
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");
    next.delete("page"); // 搜尋時回到第一頁

    const base = "/products";
    const s = next.toString();
    router.push(s ? `${base}?${s}` : base);
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 text-xl">
        search
      </span>
      <input
        className="bg-primary/5 border border-primary/20 rounded-none py-2 pl-10 pr-4 text-xs font-bold tracking-widest focus:ring-1 focus:ring-primary outline-none w-48 transition-all text-white placeholder:text-slate-500"
        placeholder="SEARCH"
        type="text"
        aria-label="搜尋商品"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
    </form>
  );
}
