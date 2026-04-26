"use client";

import { useState } from "react";

const CART_UPDATED_EVENT = "cart-updated";

async function addToCartApi(
  baseUrl: string,
  productId: number,
  userId: number | null
): Promise<boolean> {
  const body: { product_id: number; quantity: number; user_id?: number } = {
    product_id: productId,
    quantity: 1,
  };
  if (userId != null) body.user_id = userId;
  const res = await fetch(`${baseUrl}/cart/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.ok;
}

interface AddToCartButtonProps {
  productId: number;
  variant: "button" | "icon";
  className?: string;
  children?: React.ReactNode;
  /** 登入者 user_id，未傳則後端使用預設 1 */
  userId?: number | null;
}

export default function AddToCartButton({
  productId,
  variant,
  className = "",
  children,
  userId = null,
}: AddToCartButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [pending, setPending] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pending || !baseUrl) return;
    setPending(true);
    try {
      const ok = await addToCartApi(baseUrl, productId, userId ?? null);
      if (ok) {
        setShowModal(true);
        window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
        setTimeout(() => setShowModal(false), 2000);
      }
    } finally {
      setPending(false);
    }
  };

  const buttonClass =
    variant === "button"
      ? "inline-flex items-center justify-center gap-2 px-8 py-3 bg-[var(--primary)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
      : "absolute bottom-4 right-4 size-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-[var(--primary)] hover:text-white z-[2] disabled:opacity-60";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={className || buttonClass}
        aria-label="加入購物車"
      >
        {children ?? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {variant === "button" && "加入購物車"}
          </>
        )}
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-to-cart-title"
        >
          <div className="bg-[var(--surface)] border border-slate-600 rounded-lg shadow-xl px-8 py-6 text-center max-w-sm">
            <p id="add-to-cart-title" className="text-white font-medium text-lg">
              已加入購物車
            </p>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="mt-4 px-6 py-2 bg-[var(--primary)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              確定
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export { CART_UPDATED_EVENT };
