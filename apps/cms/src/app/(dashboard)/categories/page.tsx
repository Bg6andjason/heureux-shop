import { getCmsProducts, summarizeCategories, type CmsProduct } from "@/lib/products";

export default async function CategoriesPage() {
  let products: CmsProduct[] = [];
  let fetchError: string | null = null;

  try {
    products = await getCmsProducts();
  } catch {
    fetchError = "目前無法讀取分類資料，請確認後端 API 是否已啟動。";
  }

  const categories = summarizeCategories(products);

  return (
    <section className="workspace-panel">
      <div className="section-heading">
        <p>商品管理</p>
        <h2>分類</h2>
      </div>

      {fetchError ? <p className="inline-alert">{fetchError}</p> : null}

      <div className="category-grid">
        {categories.length > 0 ? (
          categories.map((category) => (
            <article className="category-item" key={category.name}>
              <strong>{category.name}</strong>
              <span>{category.count} 件商品</span>
              <span>{category.stock} 件庫存</span>
            </article>
          ))
        ) : (
          <article className="category-item">
            <strong>尚無分類</strong>
            <span>0 件商品</span>
          </article>
        )}
      </div>
    </section>
  );
}
