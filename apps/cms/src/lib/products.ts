import { getCmsApiBaseUrl } from "@/lib/api";

export type CmsProduct = {
  id: number;
  name: string;
  price: number;
  description: string | null;
  category: string | null;
  stock: number;
  image_url: string | null;
  created_at: string;
};

export type CmsCategorySummary = {
  name: string;
  count: number;
  stock: number;
};

export type CreateProductInput = {
  name: string;
  price: number;
  stock: number;
  category?: string;
  description?: string;
  image_url?: string;
};

export type ProductMutationResult =
  | { ok: true; item: CmsProduct }
  | { ok: false; message: string };

export type DeleteProductResult = { ok: true } | { ok: false; message: string };

export async function getCmsProducts(): Promise<CmsProduct[]> {
  const response = await fetch(`${getCmsApiBaseUrl()}/api/products?page=1&sort=newest`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch CMS products");
  }

  const data = (await response.json()) as { ok?: boolean; items?: CmsProduct[] };
  if (!data.ok || !Array.isArray(data.items)) {
    throw new Error("Invalid CMS products response");
  }

  return data.items;
}

export async function createCmsProduct(
  input: CreateProductInput,
  adminToken: string,
): Promise<ProductMutationResult> {
  const response = await fetch(`${getCmsApiBaseUrl()}/api/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json().catch(() => null)) as
    | { ok?: boolean; message?: string; item?: CmsProduct }
    | null;

  if (!response.ok || !data?.ok || !data.item) {
    return { ok: false, message: data?.message || "新增商品失敗，請稍後再試。" };
  }

  return { ok: true, item: data.item };
}

export async function updateCmsProduct(
  id: number,
  input: CreateProductInput,
  adminToken: string,
): Promise<ProductMutationResult> {
  const response = await fetch(`${getCmsApiBaseUrl()}/api/products/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json().catch(() => null)) as
    | { ok?: boolean; message?: string; item?: CmsProduct }
    | null;

  if (!response.ok || !data?.ok || !data.item) {
    return { ok: false, message: data?.message || "更新商品失敗，請稍後再試。" };
  }

  return { ok: true, item: data.item };
}

export async function deleteCmsProduct(
  id: number,
  adminToken: string,
): Promise<DeleteProductResult> {
  const response = await fetch(`${getCmsApiBaseUrl()}/api/products/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  const data = (await response.json().catch(() => null)) as
    | { ok?: boolean; message?: string }
    | null;

  if (!response.ok || !data?.ok) {
    return { ok: false, message: data?.message || "刪除商品失敗，請稍後再試。" };
  }

  return { ok: true };
}

export function summarizeCategories(products: CmsProduct[]): CmsCategorySummary[] {
  const summaries = new Map<string, CmsCategorySummary>();

  for (const product of products) {
    const name = product.category || "未分類";
    const current = summaries.get(name) || { name, count: 0, stock: 0 };
    current.count += 1;
    current.stock += Number(product.stock || 0);
    summaries.set(name, current);
  }

  return Array.from(summaries.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-Hant-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(value);
}
