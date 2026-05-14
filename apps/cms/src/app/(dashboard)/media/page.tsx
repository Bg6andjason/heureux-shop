import { getCmsProducts, type CmsProduct } from "@/lib/products";
import ProductImageForm from "./ProductImageForm";

function getProductImageCount(products: CmsProduct[]) {
  return products.filter((product) => product.image_url).length;
}

export default async function MediaPage() {
  let products: CmsProduct[] = [];
  let fetchError: string | null = null;

  try {
    products = await getCmsProducts();
  } catch {
    fetchError = "目前無法讀取素材資料，請確認後端 API 是否已啟動。";
  }

  const imageCount = getProductImageCount(products);
  const missingImageCount = products.length - imageCount;

  return (
    <section className="workspace-panel">
      <div className="section-heading">
        <p>媒體庫</p>
        <h2>商品圖片素材</h2>
      </div>

      {fetchError ? <p className="inline-alert">{fetchError}</p> : null}

      <div className="product-summary" aria-label="媒體摘要">
        <article>
          <span>商品數</span>
          <strong>{products.length}</strong>
        </article>
        <article>
          <span>已設定圖片</span>
          <strong>{imageCount}</strong>
        </article>
        <article>
          <span>缺少圖片</span>
          <strong>{missingImageCount}</strong>
        </article>
      </div>

      <div className="media-grid">
        {products.length > 0 ? (
          products.map((product) => (
            <article className="media-card" key={product.id}>
              <div className="media-preview">
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt={product.name} src={product.image_url} />
                ) : (
                  <span>尚無圖片</span>
                )}
              </div>
              <div>
                <strong>{product.name}</strong>
                <small>{product.category || "未分類"}</small>
              </div>
              <ProductImageForm product={product} />
            </article>
          ))
        ) : (
          <article className="media-card">
            <div className="media-preview">
              <span>尚無素材</span>
            </div>
            <strong>目前沒有商品圖片素材。</strong>
          </article>
        )}
      </div>
    </section>
  );
}
