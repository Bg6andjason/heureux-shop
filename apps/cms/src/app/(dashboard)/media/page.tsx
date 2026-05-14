const mediaSlots = ["商品主圖", "商品細節圖", "首頁橫幅", "品牌素材"];

export default function MediaPage() {
  return (
    <section className="workspace-panel">
      <div className="section-heading section-heading-row">
        <div>
          <p>媒體庫</p>
          <h2>素材管理</h2>
        </div>
        <button className="primary-button" type="button">
          上傳素材
        </button>
      </div>

      <div className="media-grid">
        {mediaSlots.map((slot) => (
          <article className="media-tile" key={slot}>
            <span>{slot}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
