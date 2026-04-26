import Link from "next/link";
import { notFound } from "next/navigation";

export interface OrderItemRow {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderDetail {
  id: number;
  user_id: number;
  total: number;
  status: string;
  created_at: string;
  items: OrderItemRow[];
}

const STATUS_LABELS: Record<string, string> = {
  created: "已建立",
  pending: "待處理",
  paid: "已付款",
  shipped: "已出貨",
  completed: "已完成",
  cancelled: "已取消",
};

async function getOrder(id: number): Promise<OrderDetail | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) return null;
  const res = await fetch(`${baseUrl}/orders/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { ok: boolean; item?: OrderDetail };
  return body.ok && body.item ? body.item : null;
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

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = parseInt(id, 10);
  if (!Number.isInteger(orderId) || orderId < 1) {
    notFound();
  }
  const order = await getOrder(orderId);
  if (!order) {
    notFound();
  }

  return (
    <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
      <Link
        href="/orders"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回訂單列表
      </Link>

      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            訂單 #{order.id}
          </h1>
          <span
            className={`text-sm px-3 py-1.5 rounded ${
              order.status === "completed"
                ? "bg-emerald-900/40 text-emerald-300"
                : order.status === "cancelled"
                  ? "bg-slate-700 text-slate-400"
                  : "bg-slate-700 text-slate-300"
            }`}
          >
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
        </div>
        <p className="text-sm text-slate-400">
          下單時間：{formatDate(order.created_at)}
        </p>

        <div className="border border-slate-700 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/50 text-slate-300 text-sm">
                <th className="px-4 py-3 font-medium">商品</th>
                <th className="px-4 py-3 font-medium text-right">單價</th>
                <th className="px-4 py-3 font-medium text-right">數量</th>
                <th className="px-4 py-3 font-medium text-right">小計</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-slate-700 text-white"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/products/${row.product_id}`}
                      className="hover:text-[var(--primary)] transition-colors"
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right">NT$ {row.price}</td>
                  <td className="px-4 py-3 text-right">{row.quantity}</td>
                  <td className="px-4 py-3 text-right">
                    NT$ {row.price * row.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <p className="text-lg font-medium text-white">
            訂單總計：NT$ {order.total}
          </p>
        </div>
      </div>

      <footer className="border-t border-slate-800 py-8 px-6 mt-12 text-center">
        <p className="text-xs text-slate-500">© 2024 HEUREUX. All rights reserved.</p>
      </footer>
    </main>
  );
}
