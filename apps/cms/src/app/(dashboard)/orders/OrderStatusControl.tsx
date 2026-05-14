"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  formatOrderStatus,
  updateCmsOrderStatus,
  type OrderStatus,
} from "@/lib/orders";

type Props = {
  id: number;
  status: OrderStatus;
};

const statuses: OrderStatus[] = ["created", "paid", "completed", "cancelled"];

export default function OrderStatusControl({ id, status }: Props) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState(status);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setMessage(null);
    setIsSubmitting(true);

    const token = window.sessionStorage.getItem("heureux-cms-admin-token");
    if (!token) {
      setIsSubmitting(false);
      setMessage("請先登入 CMS 管理員帳號。");
      return;
    }

    const result = await updateCmsOrderStatus(id, selectedStatus, token);
    setIsSubmitting(false);

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    setMessage("狀態已更新。");
    router.refresh();
  }

  return (
    <div className="status-control">
      <select
        aria-label={`更新訂單 ${id} 狀態`}
        onChange={(event) => setSelectedStatus(event.target.value as OrderStatus)}
        value={selectedStatus}
      >
        {statuses.map((item) => (
          <option key={item} value={item}>
            {formatOrderStatus(item)}
          </option>
        ))}
      </select>
      <button
        className="secondary-button"
        disabled={isSubmitting || selectedStatus === status}
        onClick={handleSubmit}
        type="button"
      >
        更新
      </button>
      {message ? <small>{message}</small> : null}
    </div>
  );
}
