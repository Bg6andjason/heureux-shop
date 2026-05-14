import {
  formatCurrency,
  formatOrderStatus,
  getCmsOrders,
  type CmsOrder,
} from "@/lib/orders";
import OrderStatusControl from "./OrderStatusControl";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-Hant-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function OrdersPage() {
  let orders: CmsOrder[] = [];
  let fetchError: string | null = null;

  try {
    orders = await getCmsOrders();
  } catch {
    fetchError = "目前無法讀取訂單資料，請確認後端 API 是否已啟動。";
  }

  const paidCount = orders.filter((order) => order.status === "paid").length;
  const revenue = orders.reduce((total, order) => total + Number(order.total || 0), 0);

  return (
    <section className="workspace-panel">
      <div className="section-heading">
        <p>訂單管理</p>
        <h2>訂單列表</h2>
      </div>

      {fetchError ? <p className="inline-alert">{fetchError}</p> : null}

      <div className="product-summary" aria-label="訂單摘要">
        <article>
          <span>訂單數</span>
          <strong>{orders.length}</strong>
        </article>
        <article>
          <span>已付款</span>
          <strong>{paidCount}</strong>
        </article>
        <article>
          <span>總金額</span>
          <strong>{formatCurrency(revenue)}</strong>
        </article>
      </div>

      <div className="data-table" role="table" aria-label="訂單列表">
        <div className="data-row order-row data-row-head" role="row">
          <span role="columnheader">訂單</span>
          <span role="columnheader">會員</span>
          <span role="columnheader">金額</span>
          <span role="columnheader">狀態</span>
          <span role="columnheader">建立時間</span>
          <span role="columnheader">操作</span>
        </div>
        {orders.length > 0 ? (
          orders.map((order) => (
            <div className="data-row order-row" role="row" key={order.id}>
              <span role="cell">#{order.id}</span>
              <span role="cell">
                <strong>{order.user_name || "未命名會員"}</strong>
                <small>{order.user_email || `User #${order.user_id}`}</small>
              </span>
              <span role="cell">{formatCurrency(order.total)}</span>
              <span role="cell">{formatOrderStatus(order.status)}</span>
              <span role="cell">{formatDate(order.created_at)}</span>
              <span role="cell">
                <OrderStatusControl id={order.id} status={order.status} />
              </span>
            </div>
          ))
        ) : (
          <div className="empty-state">目前沒有訂單資料。</div>
        )}
      </div>
    </section>
  );
}
