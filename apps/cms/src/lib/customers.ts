import { getCmsApiBaseUrl } from "@/lib/api";

export type CmsCustomer = {
  id: number;
  email: string;
  name: string | null;
  created_at: string;
  order_count: number;
  total_spent: number;
  cart_count: number;
  wishlist_count: number;
};

export async function getCmsCustomers(adminToken?: string): Promise<CmsCustomer[]> {
  if (!adminToken) {
    throw new Error("Missing CMS admin token");
  }

  const response = await fetch(`${getCmsApiBaseUrl()}/auth/admin/customers`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch CMS customers");
  }

  const data = (await response.json()) as { ok?: boolean; items?: CmsCustomer[] };
  if (!data.ok || !Array.isArray(data.items)) {
    throw new Error("Invalid CMS customers response");
  }

  return data.items;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-Hant-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(value);
}
