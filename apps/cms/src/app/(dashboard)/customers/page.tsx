import CustomerList from "./CustomerList";

export default function CustomersPage() {
  return (
    <section className="workspace-panel">
      <div className="section-heading">
        <p>會員管理</p>
        <h2>會員總覽</h2>
      </div>

      <CustomerList />
    </section>
  );
}
