export default function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="brand auth-brand">
          <span className="brand-mark">H</span>
          <span>
            <strong>Heureux Shop</strong>
            <small>CMS 管理後台</small>
          </span>
        </div>

        <div className="auth-copy-block">
          <p className="auth-eyebrow">管理員登入</p>
          <h1>登入後台</h1>
          <p className="auth-copy">請使用管理員帳號登入 Heureux Shop CMS。</p>
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

        <p className="auth-hint">下一步會串接後端管理員登入 API。</p>
      </section>
    </main>
  );
}
