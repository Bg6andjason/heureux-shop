import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import FavoriteButton from "./FavoriteButton";

export interface Product {
  id: number;
  name: string;
  price: number;
  image_url?: string | null;
  description?: string | null;
  category?: string | null;
  is_new?: boolean;
  is_favorite?: boolean | number;
}

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
  userId?: number | null;
}

export default function ProductCard({ product: p, showAddToCart = true, userId = null }: ProductCardProps) {
  return (
    <li className="tap-product-card group cursor-pointer">
      <div className="tap-product-media relative aspect-[3/4] overflow-hidden rounded-xl border border-transparent bg-slate-900 mb-4 sm:mb-6 transition-all duration-500 group-hover:shadow-[0_0_40px_rgba(255,87,34,0.1)]">
        <Link href={`/products/${p.id}`} className="tap-target block absolute inset-0" aria-label={`View ${p.name}`}>
          {p.image_url ? (
            <Image
              src={p.image_url}


              alt={p.name}
              width={400}
              height={533}
              unoptimized
              className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">No Image</div>
          )}
        </Link>
        <div className="tap-product-overlay absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300 pointer-events-none" />
        {userId !== null && (
          <div className="absolute right-4 top-4 z-[2]">
            <FavoriteButton
              productId={p.id}
              userId={userId}
              initialFavorite={Boolean(p.is_favorite)}
              showLabel={false}
              className="tap-target tap-target-subtle flex size-11 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
            />
          </div>
        )}
        {showAddToCart && (
          <div className="absolute bottom-4 left-4 right-4 opacity-100 transition-all duration-300 pointer-events-auto sm:bottom-6 sm:left-6 sm:right-6 sm:translate-y-4 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
            <AddToCartButton
              productId={p.id}
              variant="button"
              userId={userId}
              className="w-full bg-primary text-white py-4 font-display text-xl uppercase tracking-wider rounded-lg shadow-xl"
            >
              Add to Bag
            </AddToCartButton>
          </div>
        )}
      </div>
      <Link href={`/products/${p.id}`} className="tap-target tap-target-subtle flex justify-between items-start gap-4 rounded-lg -mx-2 px-2 py-2">
        <div>
          <h3 className="tap-product-title font-display text-2xl uppercase tracking-wide group-hover:text-primary transition-colors">{p.name}</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] font-bold">{p.category ?? "Limited Edition"}</p>
        </div>
        <span className="shrink-0 font-display text-2xl text-primary">NT$ {p.price}</span>
      </Link>
    </li>
  );
}
