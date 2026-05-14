import {
  formatCurrency as formatProductCurrency,
  getCmsProducts,
  type CmsProduct,
} from "@/lib/products";
import {
  formatCurrency as formatOrderCurrency,
  formatOrderStatus,
  getCmsOrders,
  type CmsOrder,
} from "@/lib/orders";

function isToday(value: string) {
  const date = new Date(value);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function buildTasks(products: CmsProduct[], orders: CmsOrder[]) {
  const lowStockCount = products.filter(
    (product) => product.stock > 0 && product.stock <= 10,
  ).length;
  const missingImageCount = products.filter((product) => !product.image_url).length;
  const createdOrderCount = orders.filter((order) => order.status === "created").length;
  const paidOrderCount = orders.filter((order) => order.status === "paid").length;

  return [
    { label: "確認新訂單付款狀態", value: `${createdOrderCount} 筆` },
    { label: "安排已付款訂單出貨", value: `${paidOrderCount} 筆` },
    { label: "補齊商品圖片", value: `${missingImageCount} 件` },
    { label: "檢查低庫存商品", value: `${lowStockCount} 件` },
  ];
}

function getRecentOrders(orders: CmsOrder[]) {
  return orders.slice(0, 5);
}

export default async function DashboardPage() {
  let products: CmsProduct[] = [];
  let orders: CmsOrder[] = [];
  let fetchError: string | null = null;

  try {
    [products, orders] = await Promise.all([getCmsProducts(), getCmsOrders()]);
  } catch {
    fetchError = "目前無法讀取總覽資料，請確認後端 API 是否已啟動。";
  }

  const todayOrders = orders.filter((order) => isToday(order.created_at));
  const todayRevenue = todayOrders.reduce(
    (total, order) => total + Number(order.total || 0),
    0,
  );
  const pendingOrders = orders.filter(
    (order) => order.status === "created" || order.status === "paid",
  );
  const activeProducts = products.filter((product) => product.stock > 0);
  const tasks = buildTasks(products, orders);
  const recentOrders = getRecentOrders(orders);

  const metrics = [
    { label: "今日訂單", value: String(todayOrders.length) },
    { label: "待處理訂單", value: String(pendingOrders.length) },
    { label: "上架商品", value: String(activeProducts.length) },
    { label: "今日營收", value: formatProductCurrency(todayRevenue) },
  ];

  return (
    <>
      {fetchError ? <p className="inline-alert">{fetchError}</p> : null}

      <section className="metric-grid" aria-label="CMS 總覽指標">
        {metrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="workspace-panel">
          <div className="section-heading">
            <p>工作區</p>
            <h2>營運待辦</h2>
          </div>
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.label}>
                <span>{task.label}</span>
                <strong>{task.value}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="workspace-panel">
          <div className="section-heading">
            <p>最近訂單</p>
            <h2>最新動態</h2>
          </div>

          <div className="activity-list">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div className="activity-item" key={order.id}>
                  <span>
                    <strong>#{order.id}</strong>
                    <small>{order.user_name || order.user_email || `User #${order.user_id}`}</small>
                  </span>
                  <span>
                    <strong>{formatOrderCurrency(order.total)}</strong>
                    <small>{formatOrderStatus(order.status)}</small>
                  </span>
                </div>
              ))
            ) : (
              <p>目前沒有近期訂單。</p>
            )}
          </div>
        </article>
      </section>
    </>
  );
}
