"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CART_UPDATED_EVENT } from "@/app/components/AddToCartButton";

export interface CartItemRow {
  id: number;
  product_id: number;
  quantity: number;
  name: string;
  price: number;
  image_url?: string | null;
  stock?: number;
}

interface CartActionsProps {
  item: CartItemRow;
  baseUrl: string;
  userId?: number | null;
}

export default function CartActions({ item, baseUrl, userId }: CartActionsProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(item.quantity);
  const [pending, setPending] = useState(false);

  const handleUpdate = async (newQty: number) => {
    if (newQty < 1) return;
    setPending(true);
    try {
      const body: { quantity: number; user_id?: number } = { quantity: newQty };
      if (userId != null) body.user_id = userId;
      const res = await fetch(`${baseUrl}/cart/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setQuantity(newQty);
        window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  };

  const handleRemove = async () => {
    setPending(true);
    try {
      const url = `${baseUrl}/cart/${item.id}?user_id=${userId}`;
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  };

  const maxQty = Math.max(1, item.stock ?? 999);

  return (
    <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center bg-[#262626] rounded-full px-2 py-1 border border-white/10">
        <button
          type="button"
          onClick={() => handleUpdate(Math.max(1, quantity - 1))}
          disabled={pending || quantity <= 1}
          className="tap-target tap-target-subtle flex size-11 items-center justify-center rounded-full hover:text-primary transition-colors disabled:opacity-50"
          aria-label="減少數量"
        >
          <span className="material-symbols-outlined text-sm">remove</span>
        </button>
        <span className="w-10 text-center text-sm font-bold">{quantity}</span>
        <button
          type="button"
          onClick={() => handleUpdate(Math.min(maxQty, quantity + 1))}
          disabled={pending || quantity >= maxQty}
          className="tap-target tap-target-subtle flex size-11 items-center justify-center rounded-full hover:text-primary transition-colors disabled:opacity-50"
          aria-label="增加數量"
        >
          <span className="material-symbols-outlined text-sm">add</span>
        </button>
      </div>
      <button
        type="button"
        onClick={handleRemove}
        disabled={pending}
        className="tap-target tap-target-subtle -mx-3 rounded-full px-3 text-slate-500 hover:text-primary flex items-center gap-2 text-[10px] font-bold transition-colors uppercase tracking-[0.2em] disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-lg">delete</span>
        Remove
      </button>
    </div>
  );
}
