import { formatCurrency, getCmsProducts, type CmsProduct } from "@/lib/products";

function getStockStatus(stock: number) {
  if (stock <= 0) return "售完";
  if (stock <= 10) return "低庫存";
  return "販售中";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-Hant-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export default async function ProductsPage() {
  let products: CmsProduct[] = [];
  let fetchError: string | null = null;

  try {
    products = await getCmsProducts();
  } catch {
    fetchError = "目前無法讀取商品資料，請確認後端 API 是否已啟動。";
  }

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

      {fetchError ? <p className="inline-alert">{fetchError}</p> : null}

      <div className="product-summary" aria-label="商品摘要">
        <article>
          <span>商品數</span>
          <strong>{products.length}</strong>
        </article>
        <article>
          <span>總庫存</span>
          <strong>{products.reduce((total, product) => total + product.stock, 0)}</strong>
        </article>
        <article>
          <span>低庫存</span>
          <strong>{products.filter((product) => product.stock > 0 && product.stock <= 10).length}</strong>
        </article>
      </div>

      <div className="data-table" role="table" aria-label="商品列表">
        <div className="data-row product-row data-row-head" role="row">
          <span role="columnheader">商品名稱</span>
          <span role="columnheader">分類</span>
          <span role="columnheader">價格</span>
          <span role="columnheader">狀態</span>
          <span role="columnheader">庫存</span>
          <span role="columnheader">建立日期</span>
        </div>
        {products.length > 0 ? (
          products.map((product) => (
            <div className="data-row product-row" role="row" key={product.id}>
              <span role="cell">
                <strong>{product.name}</strong>
                <small>{product.description || "尚無描述"}</small>
              </span>
              <span role="cell">{product.category || "未分類"}</span>
              <span role="cell">{formatCurrency(product.price)}</span>
              <span role="cell">{getStockStatus(product.stock)}</span>
              <span role="cell">{product.stock}</span>
              <span role="cell">{formatDate(product.created_at)}</span>
            </div>
          ))
        ) : (
          <div className="empty-state">目前沒有商品資料。</div>
        )}
      </div>
    </section>
  );
}
