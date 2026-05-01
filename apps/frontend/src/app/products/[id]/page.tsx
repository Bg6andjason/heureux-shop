import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AddToCartButton from "@/app/components/AddToCartButton";
import FavoriteButton from "@/app/components/FavoriteButton";
import { getAuthUserId } from "@/app/actions/auth";
import { getFavoriteStatus } from "@/app/actions/favorites";
import ProductDetailAccordion from "./ProductDetailAccordion";

interface ProductDetail {
  id: number;
  name: string;
  price: number;
  description?: string | null;
  category?: string | null;
  stock?: number;
  image_url?: string | null;
  created_at?: string;
}

async function getProduct(id: number): Promise<ProductDetail | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) return null;
  const res = await fetch(`${baseUrl}/api/products/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { ok: boolean; item?: ProductDetail };
  return body.ok && body.item ? body.item : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const productId = parseInt(id, 10);
  if (!Number.isInteger(productId) || productId < 1) return { title: "商品" };
  const product = await getProduct(productId);
  if (!product) return { title: "商品" };
  return { title: `${product.name} | HEUREUX` };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = parseInt(id, 10);
  if (!Number.isInteger(productId) || productId < 1) notFound();
  const product = await getProduct(productId);
  if (!product) notFound();
  const userId = await getAuthUserId();
  const isLoggedIn = userId !== null;
  const isFavorite = isLoggedIn ? await getFavoriteStatus(product.id) : false;
  const imageUrl =
    product.image_url ??
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80";

  return (
    <div className="min-h-screen flex flex-col">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex-grow">
        {/* Breadcrumbs */}
        <nav className="flex mb-8 text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
          <Link
            className="tap-target tap-target-subtle -mx-2 rounded-full px-2 hover:text-primary"
            href="/"
          >
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link
            className="tap-target tap-target-subtle -mx-2 rounded-full px-2 hover:text-primary"
            href="/products"
          >
            Apparel
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 dark:text-slate-100">
            {product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Image Gallery 2x2 */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative">
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative">
                <Image
                  src={imageUrl}
                  alt={`${product.name} detail`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative">
                <Image
                  src={imageUrl}
                  alt={`${product.name} back`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative">
                <Image
                  src={imageUrl}
                  alt={`${product.name} lifestyle`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="lg:col-span-5 flex flex-col space-y-8 lg:sticky lg:top-28 h-fit">
            <div>
              <span className="text-primary font-bold tracking-widest text-sm uppercase">
                {product.category ?? "Collection 01"}
              </span>
              <h2 className="text-6xl font-display mt-2 leading-[0.9] tracking-normal uppercase">
                {product.name.toUpperCase().replace(/\s+/g, " ")}
              </h2>
              <p className="text-2xl font-light mt-4 text-slate-700 dark:text-slate-300">
                NT$ {product.price.toLocaleString()}
              </p>
            </div>

            {/* Size Selection (simplified - single row) */}
            {/* <div className="grid grid-cols-5 gap-2">
              {["XS", "S", "M", "L", "XL"].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`tap-target tap-target-subtle py-3 rounded text-sm font-medium transition-colors border ${
                    s === "M"
                      ? "border-2 border-primary bg-primary/10 font-bold"
                      : "border-slate-300 dark:border-slate-800 hover:border-primary"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div> */}
            {/* Actions */}
            <div className="flex flex-col gap-4">
              {isLoggedIn ? (
                <AddToCartButton
                  productId={product.id}
                  variant="button"
                  userId={userId}
                  className="w-full bg-primary hover:bg-[#E64A19] text-white py-5 rounded font-display text-2xl tracking-wide transition-all shadow-lg shadow-primary/20"
                >
                  Add to Bag
                </AddToCartButton>
              ) : (
                <Link
                  href="/login"
                  className="tap-target tap-target-solid w-full bg-primary hover:bg-[#E64A19] text-white py-5 rounded font-display text-2xl tracking-wide transition-all shadow-lg shadow-primary/20 text-center"
                >
                  Add to Bag
                </Link>
              )}
              {isLoggedIn ? (
                <FavoriteButton
                  productId={product.id}
                  userId={userId}
                  initialFavorite={isFavorite}
                />
              ) : (
                <Link
                  href={`/login?from=/products/${product.id}`}
                  className="tap-target tap-target-subtle w-full border border-slate-300 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 py-4 rounded font-medium text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-xl">
                    favorite
                  </span>
                  Add to Wishlist
                </Link>
              )}
            </div>

            {/* Accordion: Description, Shipping, Sustainability */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
              <ProductDetailAccordion
                description={product.description}
                productName={product.name}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
