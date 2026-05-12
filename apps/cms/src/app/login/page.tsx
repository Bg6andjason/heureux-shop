export default function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="brand">
          <span className="brand-mark">H</span>
          <div>
            <strong>Heureux Shop</strong>
            <small>CMS 管理後台</small>
          </div>
        </div>

        <div>
          <p className="auth-eyebrow">管理員登入</p>
          <h1>登入後台</h1>
          <p className="auth-copy">請使用管理員帳號進入 Heureux Shop CMS。</p>
        </div>

        <form className="auth-form">
          <label>
            <span>Email</span>
            <input autoComplete="email" name="email" required type="email" />
          </label>

          <label>
            <span>密碼</span>
            <input autoComplete="current-password" name="password" required type="password" />
          </label>

          <button type="submit">登入</button>
        </form>

        <p className="auth-hint">下一階段會串接後端管理員登入 API。</p>
      </section>
    </main>
  );
}
