"use server";

import { getAuthUserId } from "./auth";

export interface FavoriteProduct {
  id: number;
  user_id: number;
  product_id: number;
  created_at: string;
  name: string;
  price: number;
  image_url?: string | null;
  category?: string | null;
  description?: string | null;
  stock?: number;
}

export async function getFavoriteProducts(): Promise<FavoriteProduct[]> {
  const userId = await getAuthUserId();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (userId === null || !baseUrl) return [];

  try {
    const res = await fetch(`${baseUrl}/favorites/list?user_id=${userId}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const body = (await res.json()) as {
      ok?: boolean;
      items?: FavoriteProduct[];
    };
    return body.ok && Array.isArray(body.items) ? body.items : [];
  } catch {
    return [];
  }
}

export async function getFavoriteStatus(productId: number): Promise<boolean> {
  const userId = await getAuthUserId();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (userId === null || !baseUrl) return false;

  try {
    const params = new URLSearchParams({
      user_id: String(userId),
      product_id: String(productId),
    });
    const res = await fetch(`${baseUrl}/favorites/status?${params}`, {
      cache: "no-store",
    });
    if (!res.ok) return false;
    const body = (await res.json()) as { ok?: boolean; is_favorite?: boolean };
    return Boolean(body.ok && body.is_favorite);
  } catch {
    return false;
  }
}
