"use client";

import { useEffect, useState } from "react";
import {
  formatCurrency,
  getCmsCustomers,
  type CmsCustomer,
} from "@/lib/customers";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-Hant-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export default function CustomerList() {
  const [customers, setCustomers] = useState<CmsCustomer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = window.sessionStorage.getItem("heureux-cms-admin-token");

    getCmsCustomers(token || undefined)
      .then((items) => {
        setCustomers(items);
        setError(null);
      })
      .catch(() => {
        setCustomers([]);
        setError("目前無法讀取會員資料，請確認已登入 CMS 並啟動後端 API。");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const newCustomers = customers.filter((customer) => {
    const createdAt = new Date(customer.created_at);
    const now = new Date();
    return (
      createdAt.getFullYear() === now.getFullYear() &&
      createdAt.getMonth() === now.getMonth()
    );
  }).length;
  const totalSpent = customers.reduce(
    (total, customer) => total + Number(customer.total_spent || 0),
    0,
  );

  return (
    <>
      {error ? <p className="inline-alert">{error}</p> : null}

      <div className="metric-grid compact">
        <article className="metric-card">
          <span>全部會員</span>
          <strong>{customers.length}</strong>
        </article>
        <article className="metric-card">
          <span>本月新增</span>
          <strong>{newCustomers}</strong>
        </article>
        <article className="metric-card">
          <span>累積消費</span>
          <strong>{formatCurrency(totalSpent)}</strong>
        </article>
      </div>

      <div className="data-table" role="table" aria-label="會員列表">
        <div className="data-row customer-row data-row-head" role="row">
          <span role="columnheader">會員</span>
          <span role="columnheader">訂單</span>
          <span role="columnheader">累積消費</span>
          <span role="columnheader">購物車</span>
          <span role="columnheader">收藏</span>
          <span role="columnheader">加入日期</span>
        </div>
        {customers.length > 0 ? (
          customers.map((customer) => (
            <div className="data-row customer-row" role="row" key={customer.id}>
              <span role="cell">
                <strong>{customer.name || "未命名會員"}</strong>
                <small>{customer.email}</small>
              </span>
              <span role="cell">{customer.order_count}</span>
              <span role="cell">{formatCurrency(customer.total_spent)}</span>
              <span role="cell">{customer.cart_count}</span>
              <span role="cell">{customer.wishlist_count}</span>
              <span role="cell">{formatDate(customer.created_at)}</span>
            </div>
          ))
        ) : (
          <div className="empty-state">
            {isLoading ? "正在讀取會員資料..." : "目前沒有會員資料。"}
          </div>
        )}
      </div>
    </>
  );
}
