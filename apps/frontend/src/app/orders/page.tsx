import Link from "next/link";
import { getAuthUserId } from "@/app/actions/auth";

const PER_PAGE = 20;
const LIST_BASE = "/orders";

export interface OrderSummary {
  id: number;
  user_id: number;
  total: number;
  status: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  created: "已建立",
  pending: "待處理",
  paid: "已付款",
  shipped: "已出貨",
  completed: "已完成",
  cancelled: "已取消",
};

async function getOrders(
  page: number,
  status: string,
  userId: number | null,
): Promise<{ items: OrderSummary[] }> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) return { items: [] };
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set("status", status);
  if (userId != null) params.set("user_id", String(userId));
  const res = await fetch(`${baseUrl}/orders?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) return { items: [] };
  const body = (await res.json()) as { ok: boolean; items?: OrderSummary[] };
  const items = Array.isArray(body.items) ? body.items : [];
  return { items };
}

function buildListUrl(page: number, status: string): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (status) params.set("status", status);
  const s = params.toString();
  return s ? `${LIST_BASE}?${s}` : LIST_BASE;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const userId = await getAuthUserId();
  if (userId === null) {
    const { redirect } = await import("next/navigation");
    redirect("/login?from=/orders");
  }
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const status = params.status ?? "";
  const { items: orders } = await getOrders(page, status, userId);

  const statusTabs = [
    { value: "", label: "全部" },
    ...Object.entries(STATUS_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-20 py-12">
        <nav className="flex items-center gap-2 mb-8 text-sm text-slate-500 dark:text-primary/60">
          <Link className="hover:text-primary transition-colors" href="/">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-100 font-medium">
            Orders
          </span>
        </nav>
        <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter uppercase mb-8">
          Orders
        </h1>

        <div className="w-full overflow-x-auto pb-2 mb-8">
          <div className="flex min-w-max gap-6 border-b border-white/10 dark:border-primary/20 px-4">
            {statusTabs.map((tab) => (
              <Link
                key={tab.value || "all"}
                href={buildListUrl(1, tab.value)}
                className={`pb-4 text-sm font-medium border-b-2 transition-all uppercase tracking-widest ${
                  status === tab.value
                    ? "text-white dark:text-slate-100 border-primary"
                    : "text-slate-400 border-transparent hover:text-slate-200 hover:border-primary/50"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-slate-400 mb-4">No orders yet</p>
            <Link
              href="/products"
              className="text-primary font-bold hover:underline uppercase tracking-widest"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-4">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/orders/${order.id}`}
                    className="block p-6 bg-white/5 dark:bg-white/5 border border-white/10 dark:border-primary/20 rounded-xl hover:border-primary/50 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-6">
                        <span className="text-white font-bold uppercase tracking-tight">
                          Order #{order.id}
                        </span>
                        <span className="text-sm text-slate-400">
                          {formatDate(order.created_at)}
                        </span>
                        <span
                          className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded ${
                            order.status === "completed"
                              ? "bg-primary/20 text-primary"
                              : order.status === "cancelled"
                                ? "bg-slate-700 text-slate-400"
                                : "bg-white/10 text-slate-300"
                          }`}
                        >
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </div>
                      <span className="text-xl font-display text-primary font-bold">
                        NT$ {order.total}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            {orders.length >= PER_PAGE && (
              <nav className="flex justify-center py-12">
                <Link
                  href={buildListUrl(page + 1, status)}
                  className="text-sm font-bold text-primary hover:underline uppercase tracking-widest"
                >
                  Load More
                </Link>
              </nav>
            )}
          </>
        )}
      </main>
    </div>
  );
}
