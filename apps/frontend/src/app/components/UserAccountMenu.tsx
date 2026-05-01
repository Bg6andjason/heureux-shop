"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

interface UserAccountMenuProps {
  label: string;
  accountEmail: string;
  orderCount: number;
  cartCount: number;
  logoutAction: () => Promise<void>;
}

const MENU_ITEMS = [
  ["會員中心", "/account", "manage_accounts"],
  ["我的訂單", "/orders", "receipt_long"],
  ["收藏清單", "/wishlist", "favorite"],
] as const;

const FADE_DURATION_MS = 180;

export default function UserAccountMenu({
  label,
  accountEmail,
  orderCount,
  cartCount,
  logoutAction,
}: UserAccountMenuProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const isOpenRef = useRef(false);
  const isClosingRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [, startTransition] = useTransition();

  const setOpenState = useCallback((next: boolean) => {
    isOpenRef.current = next;
    setIsOpen(next);
  }, []);

  const setClosingState = useCallback((next: boolean) => {
    isClosingRef.current = next;
    setIsClosing(next);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    clearTimer();
    setClosingState(false);
    setOpenState(true);
  }, [clearTimer, setClosingState, setOpenState]);

  const closeMenu = useCallback(
    (afterClose?: () => void) => {
      if (!isOpenRef.current) {
        afterClose?.();
        return;
      }

      if (isClosingRef.current) return;

      clearTimer();
      setClosingState(true);
      timerRef.current = window.setTimeout(() => {
        setOpenState(false);
        setClosingState(false);
        timerRef.current = null;
        afterClose?.();
      }, FADE_DURATION_MS);
    },
    [clearTimer, setClosingState, setOpenState],
  );

  const handleIconClick = () => {
    if (isOpenRef.current) closeMenu();
    else openMenu();
  };

  const navigateAfterFade = (href: string) => {
    closeMenu(() => router.push(href));
  };

  const logoutAfterFade = () => {
    closeMenu(() => {
      startTransition(() => {
        void logoutAction();
      });
    });
  };

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!isOpenRef.current) return;
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) closeMenu();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpenRef.current) closeMenu();
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeMenu]);

  useEffect(() => clearTimer, [clearTimer]);

  const menuVisible = isOpen || isClosing;

  return (
    <div
      ref={rootRef}
      className="user-menu-root relative flex items-center gap-2"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") openMenu();
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") closeMenu();
      }}
    >
      <span className="max-w-[120px] truncate text-sm text-slate-400">
        {label}
      </span>
      <button
        type="button"
        onClick={handleIconClick}
        className="tap-target tap-target-subtle inline-flex size-11 items-center justify-center rounded-full transition-colors hover:text-primary"
        aria-label="開啟會員選單"
        aria-haspopup="menu"
        aria-expanded={menuVisible}
      >
        <span className="material-symbols-outlined">person</span>
      </button>

      {menuVisible && (
        <div
          className={`user-menu-panel absolute right-0 top-full z-50 mt-3 w-80 border border-primary/20 bg-[#111] p-4 shadow-2xl shadow-black/40 ${
            isClosing ? "user-menu-fade-out" : "user-menu-fade-in"
          }`}
          role="menu"
        >
          <div className="border-b border-white/10 pb-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold uppercase tracking-widest text-white">
                {label}
              </p>
              {accountEmail && (
                <p className="mt-1 truncate text-xs text-slate-400">
                  {accountEmail}
                </p>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="bg-white/5 p-3">
                <p className="font-display text-lg font-bold text-white">
                  {orderCount}
                </p>
                <p className="text-[11px] uppercase tracking-widest text-slate-500">
                  Orders
                </p>
              </div>
              <div className="bg-white/5 p-3">
                <p className="font-display text-lg font-bold text-white">
                  {cartCount}
                </p>
                <p className="text-[11px] uppercase tracking-widest text-slate-500">
                  Cart
                </p>
              </div>
            </div>
          </div>
          <nav className="grid py-2 text-sm" aria-label="會員選單">
            {MENU_ITEMS.map(([text, href, icon]) => (
              <button
                key={href}
                type="button"
                onClick={() => navigateAfterFade(href)}
                className="tap-target tap-target-subtle flex items-center gap-3 px-2 py-3 text-left text-slate-300 transition-colors hover:bg-white/5 hover:text-primary"
                role="menuitem"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {icon}
                </span>
                <span>{text}</span>
              </button>
            ))}
          </nav>
          <div className="border-t border-white/10 pt-2">
            <button
              type="button"
              onClick={logoutAfterFade}
              className="tap-target tap-target-subtle flex w-full items-center gap-3 px-2 py-3 text-left text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-primary"
              role="menuitem"
            >
              <span className="material-symbols-outlined text-[20px]">
                logout
              </span>
              <span>登出</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
