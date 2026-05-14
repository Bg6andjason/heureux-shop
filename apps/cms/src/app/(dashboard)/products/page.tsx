const products = [
  { name: "尚未建立商品", status: "待新增", stock: "-" },
  { name: "精選商品版位", status: "待規劃", stock: "-" },
  { name: "新品上架清單", status: "待整理", stock: "-" },
];

export default function ProductsPage() {
  return (
    <section className="workspace-panel">
      <div className="section-heading section-heading-row">
        <div>
          <p>商品管理</p>
          <h2>商品列表</h2>
        </div>
        <button className="primary-button" type="button">
          新增商品
        </button>
      </div>

      <div className="data-table" role="table" aria-label="商品列表">
        <div className="data-row data-row-head" role="row">
          <span role="columnheader">商品名稱</span>
          <span role="columnheader">狀態</span>
          <span role="columnheader">庫存</span>
        </div>
        {products.map((product) => (
          <div className="data-row" role="row" key={product.name}>
            <span role="cell">{product.name}</span>
            <span role="cell">{product.status}</span>
            <span role="cell">{product.stock}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
