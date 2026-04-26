"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CART_UPDATED_EVENT } from "./AddToCartButton";

interface CartIconWithCountProps {
  userId?: number | null;
}

export default function CartIconWithCount({ userId }: CartIconWithCountProps) {
  const [count, setCount] = useState<number | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

  const fetchCount = useCallback(async () => {
    if (!baseUrl) return;
    try {
      const url = userId != null ? `${baseUrl}/cart/count?user_id=${userId}` : `${baseUrl}/cart/count`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;
      const body = (await res.json()) as { ok: boolean; count?: number };
      if (body.ok && typeof body.count === "number") setCount(body.count);
    } catch {
      setCount(0);
    }
  }, [baseUrl, userId]);

  useEffect(() => {
    const load = () => void fetchCount();
    load();
    window.addEventListener(CART_UPDATED_EVENT, load);
    return () => window.removeEventListener(CART_UPDATED_EVENT, load);
  }, [fetchCount]);

  const displayCount = count !== null ? count : 0;

  return (
    <Link
      href="/cart"
      className="relative hover:text-primary transition-colors"
      aria-label={userId != null ? `購物車 ${displayCount} 件` : "購物車"}
    >
      <span className="material-symbols-outlined">shopping_bag</span>
      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-black">
        {displayCount > 99 ? "99+" : displayCount}
      </span>
    </Link>
  );
}
