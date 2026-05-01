"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface FavoriteButtonProps {
  productId: number;
  userId: number | null;
  initialFavorite?: boolean;
  className?: string;
  showLabel?: boolean;
}

export default function FavoriteButton({
  productId,
  userId,
  initialFavorite = false,
  className = "",
  showLabel = true,
}: FavoriteButtonProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [pending, setPending] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

  const handleClick = async () => {
    if (pending || userId === null || !baseUrl) return;
    setPending(true);
    try {
      const res = await fetch(`${baseUrl}/favorites/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, product_id: productId }),
      });
      if (res.ok) {
        const body = (await res.json()) as {
          ok?: boolean;
          is_favorite?: boolean;
        };
        if (body.ok) {
          setIsFavorite(Boolean(body.is_favorite));
          router.refresh();
        }
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending || userId === null}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
      className={`${className || "w-full border border-slate-300 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 py-4 rounded font-medium text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"} tap-target tap-target-subtle`}
    >
      {isFavorite ? (
        <svg
          className="size-5 fill-current text-primary"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <span className="material-symbols-outlined text-xl">favorite</span>
      )}
      {showLabel && (isFavorite ? "Saved to Wishlist" : "Add to Wishlist")}
    </button>
  );
}
