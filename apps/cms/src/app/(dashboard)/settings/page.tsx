type HealthStatus = "online" | "offline";

const defaultApiBaseUrl = "http://localhost:3001";

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || defaultApiBaseUrl;
}

async function getBackendHealth(): Promise<HealthStatus> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/health`, {
      cache: "no-store",
    });
    return response.ok ? "online" : "offline";
  } catch {
    return "offline";
  }
}

const modules = [
  { label: "商品管理", status: "已啟用", detail: "列表、新增、編輯、刪除、圖片網址" },
  { label: "訂單管理", status: "已啟用", detail: "列表、金額摘要、狀態更新" },
  { label: "會員管理", status: "已啟用", detail: "會員列表、消費與收藏摘要" },
  { label: "媒體管理", status: "已啟用", detail: "商品圖片素材管理" },
];

export default async function SettingsPage() {
  const apiBaseUrl = getApiBaseUrl();
  const healthStatus = await getBackendHealth();

  return (
    <section className="workspace-panel">
      <div className="section-heading">
        <p>系統設定</p>
        <h2>CMS 設定總覽</h2>
      </div>

      <div className="settings-grid">
        <article className="settings-panel">
          <div className="section-heading">
            <p>API</p>
            <h2>後端連線</h2>
          </div>
          <dl className="settings-definition">
            <div>
              <dt>API Base URL</dt>
              <dd>{apiBaseUrl}</dd>
            </div>
            <div>
              <dt>Health Check</dt>
              <dd>
                <span className={`status-pill ${healthStatus}`}>
                  {healthStatus === "online" ? "Online" : "Offline"}
                </span>
              </dd>
            </div>
          </dl>
        </article>

        <article className="settings-panel">
          <div className="section-heading">
            <p>Auth</p>
            <h2>管理員登入</h2>
          </div>
          <dl className="settings-definition">
            <div>
              <dt>登入方式</dt>
              <dd>後端 Admin JWT</dd>
            </div>
            <div>
              <dt>Token 儲存</dt>
              <dd>Browser sessionStorage</dd>
            </div>
          </dl>
        </article>
      </div>

      <section className="settings-panel">
        <div className="section-heading">
          <p>Modules</p>
          <h2>功能模組</h2>
        </div>

        <div className="settings-list">
          {modules.map((module) => (
            <article className="settings-item" key={module.label}>
              <div>
                <strong>{module.label}</strong>
                <span>{module.detail}</span>
              </div>
              <span className="status-pill online">{module.status}</span>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
