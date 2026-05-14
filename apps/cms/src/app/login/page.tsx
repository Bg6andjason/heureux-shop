import LoginForm from "./LoginForm";

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

        <LoginForm />

        <p className="auth-hint">請使用後端建立的管理員帳號登入。</p>
      </section>
    </main>
  );
}
