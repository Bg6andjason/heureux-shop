import Link from "next/link";
import { getAuthUserId } from "@/app/actions/auth";
import ProductCard, { type Product } from "../components/ProductCard";
import SortDropdown from "../components/SortDropdown";
import CategoryDropdown from "../components/CategoryDropdown";

const PER_PAGE = 20;
const LIST_BASE = "/products";

async function getCategories(): Promise<string[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) return [];
  const res = await fetch(`${baseUrl}/api/products/categories`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const body = (await res.json()) as { ok: boolean; items: string[] };
  return Array.isArray(body.items) ? body.items : [];
}

async function getProducts(
  page: number,
  q: string,
  category: string,
  sort: string,
  userId: number | null,
): Promise<{ items: Product[]; total: number; perPage: number }> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) throw new Error("缺少 NEXT_PUBLIC_API_BASE_URL");
  const params = new URLSearchParams({ page: String(page) });
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (sort) params.set("sort", sort);
  if (userId !== null) params.set("user_id", String(userId));
  const res = await fetch(`${baseUrl}/api/products?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("取得商品列表失敗");
  const body = (await res.json()) as { ok: boolean; items: Product[] };
  const items = Array.isArray(body.items) ? body.items : [];
  const total =
    items.length < PER_PAGE
      ? (page - 1) * PER_PAGE + items.length
      : page * PER_PAGE;
  return { items, total, perPage: PER_PAGE };
}

function buildListUrl(
  page: number,
  q: string,
  category: string,
  sort: string,
): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (sort) params.set("sort", sort);
  const s = params.toString();
  return s ? `${LIST_BASE}?${s}` : LIST_BASE;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    category?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const q = params.q ?? "";
  const category = params.category ?? "";
  const sort = params.sort ?? "newest";
  const userId = await getAuthUserId();
  const [categories, { items }] = await Promise.all([
    getCategories(),
    getProducts(page, q, category, sort, userId),
  ]);

  // 下方為不用解構的寫法
  // const results = await Promise.all([
  //   getCategories(),
  //   getProducts(page, q, category),
  // ]);

  // const categories = results[0];
  // const products = results[1].items;

  const totalPages = items.length >= PER_PAGE ? page + 1 : page;
  const currentPage = Math.min(page, totalPages);
  const showLoadMore = currentPage < totalPages;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <main className="max-w-7xl mx-auto w-full px-6 lg:px-20 py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-xs font-medium uppercase tracking-widest opacity-60">
          <Link className="tap-target tap-target-subtle -mx-2 rounded-full px-2 hover:text-primary transition-colors" href="/">
            Home
          </Link>
          <span className="material-symbols-outlined text-[10px]">
            chevron_right
          </span>
          <span className="text-primary">All Products</span>
        </nav>

        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-7xl md:text-9xl font-display font-black mb-4 tracking-normal uppercase leading-none">
            All <span className="text-primary">Products</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl text-lg font-light">
            A curated assembly of monochromatic precision. Designed for those
            who appreciate the subtle intersection of form and function.
          </p>
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-12 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <CategoryDropdown categories={categories} />
          </div>
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
            <span className="opacity-50">Sort by:</span>
            <SortDropdown />
          </div>
        </div>

        {/* Product Grid */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {items.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              showAddToCart={userId !== null}
              userId={userId}
            />
          ))}
        </ul>

        {/* Load More + Pagination dots */}
        <div className="mt-24 flex flex-col items-center gap-6">
          {showLoadMore && (
            <Link
              href={buildListUrl(currentPage + 1, q, category, sort)}
              className="tap-target tap-target-solid px-12 py-5 bg-transparent border-2 border-primary text-primary font-display text-2xl uppercase tracking-widest rounded-lg hover:bg-primary hover:text-white transition-all duration-300"
            >
              Load More
            </Link>
          )}
          {/* <div className="flex gap-4">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
              <span
                key={i}
                className={`size-2 rounded-full ${i === 0 ? "bg-primary" : "bg-primary/20"}`}
                aria-hidden
              />
            ))}
          </div> */}
        </div>
      </main>
    </div>
  );
}
