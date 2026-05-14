const settings = ["商店基本資料", "管理員權限", "付款與物流", "API 連線"];

export default function SettingsPage() {
  return (
    <section className="workspace-panel">
      <div className="section-heading">
        <p>系統設定</p>
        <h2>設定項目</h2>
      </div>

      <div className="settings-list">
        {settings.map((setting) => (
          <button type="button" key={setting}>
            {setting}
          </button>
        ))}
      </div>
    </section>
  );
}
