"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CART_UPDATED_EVENT } from "@/app/components/AddToCartButton";

interface CheckoutButtonProps {
  baseUrl: string;
  userId?: number | null;
}

export default function CheckoutButton({ baseUrl, userId }: CheckoutButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleCheckout = async () => {
    if (pending || !baseUrl) return;
    setPending(true);
    try {
      const body: { user_id?: number } = {};
      if (userId != null) body.user_id = userId;
      const res = await fetch(`${baseUrl}/cart/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      let data: { ok?: boolean; order_id?: number; message?: string } = {};
      try {
        data = text ? (JSON.parse(text) as typeof data) : {};
      } catch {
        console.error("Checkout: response is not JSON", text.slice(0, 200));
      }
      if (res.ok && data.ok && typeof data.order_id === "number") {
        window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
        router.push(`/orders/${data.order_id}`);
        router.refresh();
      } else {
        console.error("Checkout failed:", data.message ?? res.statusText);
        router.refresh();
      }
    } catch (e) {
      console.error("Checkout error:", e);
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={pending}
      className="tap-target tap-target-solid flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-5 font-display text-xl tracking-[0.15em] text-white shadow-lg shadow-primary/20 transition-all hover:bg-[#E64A19] disabled:opacity-60"
    >
      {pending ? "Processing..." : "Checkout"}
      <span className="material-symbols-outlined text-lg" aria-hidden>
        arrow_forward
      </span>
    </button>
  );
}
