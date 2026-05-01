"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

const CART_UPDATED_EVENT = "cart-updated";

async function addToCartApi(
  baseUrl: string,
  productId: number,
  userId: number | null,
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
  const [added, setAdded] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pending || !baseUrl) return;
    setPending(true);
    try {
      const ok = await addToCartApi(baseUrl, productId, userId ?? null);
      if (ok) {
        setAdded(true);
        setShowModal(true);
        window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
        window.setTimeout(() => setShowModal(false), 1600);
        window.setTimeout(() => setAdded(false), 1400);
      }
    } finally {
      setPending(false);
    }
  };

  const buttonClass =
    variant === "button"
      ? "inline-flex items-center justify-center gap-2 px-8 py-3 bg-[var(--primary)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-60"
      : "absolute bottom-4 right-4 size-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-[var(--primary)] hover:text-white z-[2] disabled:opacity-60";
  const finalClassName = `${className || buttonClass} tap-target tap-target-solid`;

  const modal =
    showModal && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-to-cart-title"
          >
            <div className="rounded-lg border border-primary/30 bg-[var(--surface-dark)] px-8 py-6 text-center shadow-xl">
              <p id="add-to-cart-title" className="text-lg font-medium text-white">
                Added to bag
              </p>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="tap-target tap-target-solid mt-4 rounded-lg bg-[var(--primary)] px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                OK
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={finalClassName}
        aria-label="Add to bag"
        aria-live="polite"
      >
        {pending ? (
          "Adding..."
        ) : added ? (
          "Added"
        ) : (
          children ?? (
            <>
              <span className="material-symbols-outlined text-xl" aria-hidden>
                shopping_bag
              </span>
              {variant === "button" && "Add to Bag"}
            </>
          )
        )}
      </button>

      {modal}
    </>
  );
}

export { CART_UPDATED_EVENT };
