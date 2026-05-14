export type OrderStatus = "created" | "paid" | "completed" | "cancelled";

export type CmsOrder = {
  id: number;
  user_id: number;
  user_email: string | null;
  user_name: string | null;
  total: number;
  status: OrderStatus;
  created_at: string;
};

export type UpdateOrderStatusResult =
  | { ok: true; item: CmsOrder }
  | { ok: false; message: string };

const defaultApiBaseUrl = "http://localhost:3001";

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || defaultApiBaseUrl;
}

export async function getCmsOrders(): Promise<CmsOrder[]> {
  const response = await fetch(`${getApiBaseUrl()}/orders?page=1`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch CMS orders");
  }

  const data = (await response.json()) as { ok?: boolean; items?: CmsOrder[] };
  if (!data.ok || !Array.isArray(data.items)) {
    throw new Error("Invalid CMS orders response");
  }

  return data.items;
}

export async function updateCmsOrderStatus(
  id: number,
  status: OrderStatus,
  adminToken: string,
): Promise<UpdateOrderStatusResult> {
  const response = await fetch(`${getApiBaseUrl()}/orders/${id}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  const data = (await response.json().catch(() => null)) as
    | { ok?: boolean; message?: string; item?: CmsOrder }
    | null;

  if (!response.ok || !data?.ok || !data.item) {
    return { ok: false, message: data?.message || "更新訂單狀態失敗。" };
  }

  return { ok: true, item: data.item };
}

export function formatOrderStatus(status: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    created: "已建立",
    paid: "已付款",
    completed: "已完成",
    cancelled: "已取消",
  };

  return labels[status] || status;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-Hant-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(value);
}
