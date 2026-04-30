import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUserId } from "@/app/actions/auth";
import { getFavoriteProducts } from "@/app/actions/favorites";
import ProductCard, { type Product } from "@/app/components/ProductCard";

export const metadata = {
  title: "Wishlist | HEUREUX",
  description: "View your saved HEUREUX products.",
};

export default async function WishlistPage() {
  const userId = await getAuthUserId();
  if (userId === null) redirect("/login?from=/wishlist");

  const favorites = await getFavoriteProducts();
  const products: Product[] = favorites.map((item) => ({
    id: item.product_id,
    name: item.name,
    price: item.price,
    image_url: item.image_url,
    description: item.description,
    category: item.category,
    is_favorite: true,
  }));

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12 md:px-20">
      <nav className="mb-8 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
        <Link className="transition-colors hover:text-primary" href="/">
          Home
        </Link>
        <span className="material-symbols-outlined text-[10px]">
          chevron_right
        </span>
        <span className="text-primary">Wishlist</span>
      </nav>

      <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
            Member Picks
          </p>
          <h1 className="font-display text-6xl font-black uppercase leading-none tracking-normal text-white md:text-8xl">
            Wishlist
          </h1>
        </div>
        <p className="text-sm uppercase tracking-widest text-slate-500">
          {products.length} saved
        </p>
      </div>

      {products.length === 0 ? (
        <section className="flex min-h-[320px] flex-col items-center justify-center border border-white/10 bg-white/[0.03] px-6 text-center">
          <span className="material-symbols-outlined mb-4 text-5xl text-primary">
            favorite
          </span>
          <h2 className="font-display text-3xl font-bold uppercase tracking-normal text-white">
            No Saved Products
          </h2>
          <p className="mt-3 max-w-md text-sm text-slate-400">
            Keep your favorite pieces here and return when you are ready.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex items-center gap-2 bg-primary px-8 py-4 font-display text-xl uppercase tracking-widest text-white transition-opacity hover:opacity-90"
          >
            Browse Products
            <span className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          </Link>
        </section>
      ) : (
        <ul className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showAddToCart
              userId={userId}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
