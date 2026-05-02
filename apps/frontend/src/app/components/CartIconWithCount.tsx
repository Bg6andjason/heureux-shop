"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CART_UPDATED_EVENT } from "./AddToCartButton";

interface CartIconWithCountProps {
  userId?: number | null;
  className?: string;
}

export default function CartIconWithCount({
  userId,
  className = "",
}: CartIconWithCountProps) {
  const [count, setCount] = useState<number | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

  const fetchCount = useCallback(async () => {
    if (userId == null || !baseUrl) {
      setCount(0);
      return;
    }

    try {
      const url = `${baseUrl}/cart/count?user_id=${userId}`;
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
      className={`tap-target tap-target-subtle relative inline-flex size-11 items-center justify-center rounded-full transition-colors hover:text-primary ${className}`}
      aria-label={
        userId != null ? `Cart, ${displayCount} items` : "Cart, sign in required"
      }
    >
      <span className="material-symbols-outlined">shopping_bag</span>
      <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-black">
        {displayCount > 99 ? "99+" : displayCount}
      </span>
    </Link>
  );
}
