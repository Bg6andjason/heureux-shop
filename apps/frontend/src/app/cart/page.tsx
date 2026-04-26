import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getAuthUserId } from "@/app/actions/auth";
import CartActions from "./CartActions";
import CheckoutButton from "./CheckoutButton";

export const metadata: Metadata = {
  title: "Your Cart | HEUREUX",
  description: "View and manage your cart",
};

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  created_at: string;
  name: string;
  price: number;
  image_url?: string | null;
  stock?: number;
}

async function getCartItems(userId: number | null): Promise<CartItem[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) return [];
  try {
    const url = userId ? `${baseUrl}/cart/list?user_id=${userId}` : `${baseUrl}/cart/list`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const body = (await res.json()) as { ok: boolean; items?: CartItem[] };
    return Array.isArray(body.items) ? body.items : [];
  } catch {
    return [];
  }
}

export default async function CartPage() {
  const userId = await getAuthUserId();
  if (userId === null) {
    const { redirect } = await import("next/navigation");
    redirect("/login?from=/cart");
  }
  const items = await getCartItems(userId);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const estimatedTax = Math.round(subtotal * 0.08);
  const total = subtotal + estimatedTax;

  return (
    <div className="layout-container flex h-full grow flex-col min-h-screen">
      <main className="max-w-7xl mx-auto w-full px-6 md:px-20 py-12">
        <div className="grid flex-cols-1 lg:grid-cols-12 gap-16">
          {/* Left: Cart Items */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="flex items-baseline justify-between border-b border-white/10 pb-6">
              <h1 className="text-6xl font-display tracking-normal font-bold">Your Cart</h1>
              <p className="text-slate-500 font-medium">{items.length} Items Selected</p>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-slate-400 mb-4">Your cart is empty</p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-10">
                  {items.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-6 items-start sm:items-center py-4 group">
                      <Link href={`/products/${item.product_id}`} className="flex-shrink-0 w-32">
                        <div className="bg-[#262626] rounded-xl overflow-hidden aspect-square border border-white/5">
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              width={128}
                              height={128}
                              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm text-slate-500">No Image</div>
                          )}
                        </div>
                      </Link>
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-bold uppercase tracking-tight">{item.name}</h3>
                          <p className="text-xl font-display tracking-wide">NT$ {item.price * item.quantity}</p>
                        </div>
                        <p className="text-slate-500 text-sm">Size: Medium | Color: —</p>
                        <CartActions item={item} baseUrl={baseUrl} userId={userId} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="h-px bg-white/5" />
                <div className="mt-12 p-8 rounded-2xl bg-[#262626] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary">local_shipping</span>
                    <p className="text-sm font-medium">
                      You qualify for <span className="text-primary font-bold uppercase tracking-wide">Free Standard Shipping</span>
                    </p>
                  </div>
                  <Link className="text-[10px] font-black uppercase tracking-[0.2em] border-b-2  border-primary/40 hover:border-primary transition-all pb-1" href="#">
                    Details
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-[var(--surface-dark)] rounded-2xl p-8 sticky top-32 border border-white/10">
              <h2 className="text-3xl font-display mb-8 tracking-wide font-bold">Order Summary</h2>
              <div className="flex flex-col gap-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm uppercase tracking-widest">Subtotal</span>
                  <span className="font-bold">NT$ {subtotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm uppercase tracking-widest">Shipping</span>
                  <span className="font-bold text-primary">FREE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm uppercase tracking-widest">Estimated Tax</span>
                  <span className="font-bold">NT$ {estimatedTax}</span>
                </div>
                <div className="h-px bg-white/5 my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-display tracking-wider font-bold">Total</span>
                  <span className="text-4xl font-display text-primary tracking-wider font-bold">NT$ {total}</span>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <CheckoutButton baseUrl={baseUrl} userId={userId} />
                <Link
                  href="/products"
                  className="w-full bg-transparent text-white border border-white/20 py-5 rounded-xl font-display text-xl tracking-[0.15em] hover:bg-white/5 transition-all text-center"
                >
                  Continue Shopping
                </Link>
              </div>
              <div className="mt-8 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-500 text-sm">verified_user</span>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-relaxed">
                    Secure payment processed by stripe encrypted with 256-bit SSL
                  </p>
                </div>
                <div className="flex gap-4 items-center justify-center opacity-30 grayscale contrast-125">
                  <span className="material-symbols-outlined">credit_card</span>
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                  <span className="material-symbols-outlined">payments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="mt-auto border-t border-white/5 py-12 px-6 md:px-20 bg-[var(--background-dark)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-30">
            <span className="material-symbols-outlined text-sm">filter_vintage</span>
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold">© 2024 HEUREUX ATELIER</p>
          </div>
          <div className="flex gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
            <Link className="hover:text-primary transition-colors" href="#">Privacy</Link>
            <Link className="hover:text-primary transition-colors" href="#">Terms</Link>
            <Link className="hover:text-primary transition-colors" href="#">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
