"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AdminSession = {
  email?: string;
  name?: string | null;
};

type Props = {
  children: React.ReactNode;
};

function readAdminSession(): AdminSession | null {
  const token = window.sessionStorage.getItem("heureux-cms-admin-token");
  const rawAdmin = window.sessionStorage.getItem("heureux-cms-admin");

  if (!token || !rawAdmin) {
    return null;
  }

  try {
    return JSON.parse(rawAdmin) as AdminSession;
  } catch {
    return null;
  }
}

export default function DashboardAuthGuard({ children }: Props) {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const session = readAdminSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      setAdmin(session);
      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  function handleLogout() {
    window.sessionStorage.removeItem("heureux-cms-admin-token");
    window.sessionStorage.removeItem("heureux-cms-admin");
    router.replace("/login");
  }

  if (!isReady) {
    return (
      <main className="auth-check-page">
        <section className="auth-check-panel">
          <strong>正在確認管理員登入狀態</strong>
          <span>請稍候...</span>
        </section>
      </main>
    );
  }

  return (
    <>
      <header className="cms-header">
        <div>
          <p>後台管理</p>
          <h1>Heureux Shop CMS</h1>
        </div>
        <div className="admin-session">
          <span>
            <strong>{admin?.name || "CMS Admin"}</strong>
            <small>{admin?.email || "admin"}</small>
          </span>
          <button className="header-action" onClick={handleLogout} type="button">
            登出
          </button>
        </div>
      </header>

      {children}
    </>
  );
}
