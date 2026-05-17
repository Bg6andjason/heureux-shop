import Link from "next/link";
import { redirect } from "next/navigation";
import {
  formatCurrency,
  getCmsProductPage,
  type CmsProduct,
} from "@/lib/products";
import ProductActions from "./ProductActions";
import ProductCreateForm from "./ProductCreateForm";

type ProductsPageProps = {
  searchParams: Promise<{ page?: string }>;
};

function getStockStatus(stock: number) {
  if (stock <= 0) return "售完";
  if (stock <= 10) return "低庫存";
  return "庫存正常";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-Hant-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function parsePage(value: string | undefined) {
  const page = parseInt(value ?? "1", 10);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function buildPageHref(page: number) {
  return page > 1 ? `/products?page=${page}` : "/products";
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const requestedPage = parsePage(params.page);
  let products: CmsProduct[] = [];
  let currentPage = requestedPage;
  let totalProducts = 0;
  let totalPages = 1;
  let fetchError: string | null = null;

  try {
    const productPage = await getCmsProductPage(requestedPage);
    if (requestedPage > productPage.totalPages) {
      redirect(buildPageHref(productPage.totalPages));
    }

    products = productPage.items;
    currentPage = productPage.page;
    totalProducts = productPage.total;
    totalPages = productPage.totalPages;
  } catch {
    fetchError = "目前無法讀取商品資料，請確認後端 API 是否已啟動。";
  }

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <section className="workspace-panel">
      <div className="section-heading section-heading-row">
        <div>
          <p>商品管理</p>
          <h2>商品列表</h2>
        </div>
      </div>

      {fetchError ? <p className="inline-alert">{fetchError}</p> : null}

      <section className="product-create-panel" aria-label="新增商品">
        <div className="section-heading">
          <p>新增商品</p>
          <h2>建立商品資料</h2>
        </div>
        <ProductCreateForm />
      </section>

      <div className="product-summary" aria-label="商品摘要">
        <article>
          <span>商品數</span>
          <strong>{totalProducts}</strong>
        </article>
        <article>
          <span>本頁庫存數</span>
          <strong>{products.reduce((total, product) => total + product.stock, 0)}</strong>
        </article>
        <article>
          <span>本頁低庫存</span>
          <strong>{products.filter((product) => product.stock > 0 && product.stock <= 10).length}</strong>
        </article>
      </div>

      <div className="table-toolbar" aria-label="商品分頁狀態">
        <span>
          第 {currentPage} / {totalPages} 頁
        </span>
        <div className="pagination-actions">
          {hasPreviousPage ? (
            <Link className="secondary-button" href={buildPageHref(currentPage - 1)}>
              上一頁
            </Link>
          ) : (
            <span className="secondary-button is-disabled" aria-disabled="true">
              上一頁
            </span>
          )}
          {hasNextPage ? (
            <Link className="secondary-button" href={buildPageHref(currentPage + 1)}>
              下一頁
            </Link>
          ) : (
            <span className="secondary-button is-disabled" aria-disabled="true">
              下一頁
            </span>
          )}
        </div>
      </div>

      <div className="data-table" role="table" aria-label="商品列表">
        <div className="data-row product-row data-row-head" role="row">
          <span role="columnheader">商品名稱</span>
          <span role="columnheader">分類</span>
          <span role="columnheader">價格</span>
          <span role="columnheader">狀態</span>
          <span role="columnheader">庫存</span>
          <span role="columnheader">建立時間</span>
          <span role="columnheader">操作</span>
        </div>
        {products.length > 0 ? (
          products.map((product) => (
            <div className="data-row product-row" role="row" key={product.id}>
              <span role="cell">
                <strong>{product.name}</strong>
                <small>{product.description || "尚未填寫描述"}</small>
              </span>
              <span role="cell">{product.category || "未分類"}</span>
              <span role="cell">{formatCurrency(product.price)}</span>
              <span role="cell">{getStockStatus(product.stock)}</span>
              <span role="cell">{product.stock}</span>
              <span role="cell">{formatDate(product.created_at)}</span>
              <span role="cell">
                <ProductActions product={product} />
              </span>
            </div>
          ))
        ) : (
          <div className="empty-state">目前沒有商品資料。</div>
        )}
      </div>
    </section>
  );
}
