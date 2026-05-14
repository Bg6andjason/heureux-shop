"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateCmsProduct, type CmsProduct } from "@/lib/products";

type Props = {
  product: CmsProduct;
};

export default function ProductImageForm({ product }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setMessage(null);
    setIsSubmitting(true);

    const token = window.sessionStorage.getItem("heureux-cms-admin-token");
    if (!token) {
      setIsSubmitting(false);
      setMessage("請先登入 CMS 管理員帳號。");
      return;
    }

    const result = await updateCmsProduct(
      product.id,
      {
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category || "",
        description: product.description || "",
        image_url: String(formData.get("image_url") ?? ""),
      },
      token,
    );

    setIsSubmitting(false);

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    setMessage("圖片網址已更新。");
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="media-form">
      <label>
        <span>{product.name}</span>
        <input
          defaultValue={product.image_url || ""}
          name="image_url"
          placeholder="https://example.com/image.jpg"
          type="url"
        />
      </label>
      <button className="secondary-button" disabled={isSubmitting} type="submit">
        {isSubmitting ? "儲存中..." : "儲存"}
      </button>
      {message ? <small>{message}</small> : null}
    </form>
  );
}
