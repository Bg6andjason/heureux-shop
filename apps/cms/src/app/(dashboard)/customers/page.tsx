const segments = [
  { label: "全部會員", value: "0" },
  { label: "本月新增", value: "0" },
  { label: "待處理客服", value: "0" },
];

export default function CustomersPage() {
  return (
    <section className="workspace-panel">
      <div className="section-heading">
        <p>會員管理</p>
        <h2>會員總覽</h2>
      </div>

      <div className="metric-grid compact">
        {segments.map((segment) => (
          <article className="metric-card" key={segment.label}>
            <span>{segment.label}</span>
            <strong>{segment.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
