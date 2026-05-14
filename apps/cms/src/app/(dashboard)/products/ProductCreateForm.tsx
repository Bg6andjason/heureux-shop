"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCmsProduct } from "@/lib/products";

export default function ProductCreateForm() {
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

    const result = await createCmsProduct(
      {
        name: String(formData.get("name") ?? ""),
        price: Number(formData.get("price")),
        stock: Number(formData.get("stock")),
        category: String(formData.get("category") ?? ""),
        description: String(formData.get("description") ?? ""),
        image_url: String(formData.get("image_url") ?? ""),
      },
      token,
    );

    setIsSubmitting(false);

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    setMessage("商品已新增。");
    const form = document.querySelector<HTMLFormElement>(".product-form");
    form?.reset();
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="product-form">
      <div className="form-grid">
        <label>
          <span>商品名稱</span>
          <input name="name" required type="text" />
        </label>
        <label>
          <span>分類</span>
          <input name="category" type="text" />
        </label>
        <label>
          <span>價格</span>
          <input min="0" name="price" required step="1" type="number" />
        </label>
        <label>
          <span>庫存</span>
          <input min="0" name="stock" required step="1" type="number" />
        </label>
      </div>

      <label>
        <span>圖片網址</span>
        <input name="image_url" type="url" />
      </label>

      <label>
        <span>商品描述</span>
        <textarea name="description" rows={3} />
      </label>

      <div className="form-actions">
        {message ? <p className="form-message">{message}</p> : null}
        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "新增中..." : "新增商品"}
        </button>
      </div>
    </form>
  );
}
