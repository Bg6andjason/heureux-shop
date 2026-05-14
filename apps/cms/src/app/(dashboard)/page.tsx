const metrics = [
  { label: "今日訂單", value: "0" },
  { label: "待出貨訂單", value: "0" },
  { label: "上架商品", value: "0" },
  { label: "今日營收", value: "NT$0" },
];

const tasks = ["確認新訂單付款狀態", "補齊商品圖片與分類", "檢查庫存不足商品"];

export default function DashboardPage() {
  return (
    <>
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
              <li key={task}>{task}</li>
            ))}
          </ul>
        </article>

        <article className="workspace-panel">
          <div className="section-heading">
            <p>狀態</p>
            <h2>CMS 架構已就緒</h2>
          </div>
          <p>
            目前已建立 App Router 主版型與主要管理頁面，後續可接上管理員登入與後端 API。
          </p>
        </article>
      </section>
    </>
  );
}
