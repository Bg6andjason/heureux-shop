const orders = [
  { id: "尚無訂單", customer: "-", total: "NT$0", status: "待同步" },
  { id: "最近訂單", customer: "-", total: "NT$0", status: "待串接" },
];

export default function OrdersPage() {
  return (
    <section className="workspace-panel">
      <div className="section-heading">
        <p>訂單管理</p>
        <h2>訂單列表</h2>
      </div>

      <div className="data-table" role="table" aria-label="訂單列表">
        <div className="data-row data-row-four data-row-head" role="row">
          <span role="columnheader">訂單</span>
          <span role="columnheader">會員</span>
          <span role="columnheader">金額</span>
          <span role="columnheader">狀態</span>
        </div>
        {orders.map((order) => (
          <div className="data-row data-row-four" role="row" key={order.id}>
            <span role="cell">{order.id}</span>
            <span role="cell">{order.customer}</span>
            <span role="cell">{order.total}</span>
            <span role="cell">{order.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
