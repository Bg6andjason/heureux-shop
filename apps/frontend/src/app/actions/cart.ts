"use server";

import { redirect } from "next/navigation";
import { getAuthUserId } from "./auth";

export async function addToCart(formData: FormData) {
  const productId = formData.get("product_id");
  const id =
    typeof productId === "string" ? parseInt(productId, 10) : Number(productId);
  if (!Number.isInteger(id) || id < 1) return;

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) return;

  const userId = await getAuthUserId();
  const body: { product_id: number; quantity: number; user_id?: number } = {
    product_id: id,
    quantity: 1,
  };
  if (userId != null) body.user_id = userId;

  await fetch(`${baseUrl}/cart/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  redirect("/cart");
}
