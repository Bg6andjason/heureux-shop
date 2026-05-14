const categories = ["上衣", "褲裝", "配件", "新品"];

export default function CategoriesPage() {
  return (
    <section className="workspace-panel">
      <div className="section-heading">
        <p>商品管理</p>
        <h2>分類</h2>
      </div>

      <div className="category-grid">
        {categories.map((category) => (
          <article className="category-item" key={category}>
            <strong>{category}</strong>
            <span>0 件商品</span>
          </article>
        ))}
      </div>
    </section>
  );
}
