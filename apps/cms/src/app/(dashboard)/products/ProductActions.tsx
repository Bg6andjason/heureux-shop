"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  getCmsAdminToken,
  missingAdminSessionMessage,
} from "@/lib/cms-session";
import {
  deleteCmsProduct,
  updateCmsProduct,
  type CmsProduct,
} from "@/lib/products";

type Props = {
  product: CmsProduct;
};

export default function ProductActions({ product }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleUpdate(formData: FormData) {
    setMessage(null);
    setIsSubmitting(true);

    const token = getCmsAdminToken();
    if (!token) {
      setIsSubmitting(false);
      setMessage(missingAdminSessionMessage);
      return;
    }

    const result = await updateCmsProduct(
      product.id,
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

    setIsEditing(false);
    setMessage("商品已更新。");
    router.refresh();
  }

  async function handleDelete() {
    setMessage(null);

    const confirmed = window.confirm(`確定要刪除「${product.name}」嗎？`);
    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);

    const token = getCmsAdminToken();
    if (!token) {
      setIsSubmitting(false);
      setMessage(missingAdminSessionMessage);
      return;
    }

    const result = await deleteCmsProduct(product.id, token);
    setIsSubmitting(false);

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="product-actions">
      <div className="action-buttons">
        <button
          className="secondary-button"
          onClick={() => setIsEditing((value) => !value)}
          type="button"
        >
          {isEditing ? "取消" : "編輯"}
        </button>
        <button
          className="danger-button"
          disabled={isSubmitting}
          onClick={handleDelete}
          type="button"
        >
          刪除
        </button>
      </div>

      {message ? <p className="form-message">{message}</p> : null}

      {isEditing ? (
        <form action={handleUpdate} className="product-edit-form">
          <label>
            <span>商品名稱</span>
            <input defaultValue={product.name} name="name" required type="text" />
          </label>
          <div className="form-grid compact">
            <label>
              <span>分類</span>
              <input defaultValue={product.category || ""} name="category" type="text" />
            </label>
            <label>
              <span>價格</span>
              <input defaultValue={product.price} min="0" name="price" required type="number" />
            </label>
            <label>
              <span>庫存</span>
              <input defaultValue={product.stock} min="0" name="stock" required type="number" />
            </label>
          </div>
          <label>
            <span>圖片網址</span>
            <input defaultValue={product.image_url || ""} name="image_url" type="url" />
          </label>
          <label>
            <span>商品描述</span>
            <textarea defaultValue={product.description || ""} name="description" rows={3} />
          </label>
          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? "儲存中..." : "儲存變更"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
