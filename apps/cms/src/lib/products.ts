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

const defaultApiBaseUrl = "http://localhost:3001";

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || defaultApiBaseUrl;
}

export async function getCmsProducts(): Promise<CmsProduct[]> {
  const response = await fetch(`${getApiBaseUrl()}/api/products?page=1&sort=newest`, {
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
