"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearCmsAdminSession,
  getCmsAdminSession,
  type CmsAdminSession,
} from "@/lib/cms-session";

type Props = {
  children: React.ReactNode;
};

export default function DashboardAuthGuard({ children }: Props) {
  const router = useRouter();
  const [admin, setAdmin] = useState<CmsAdminSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const session = getCmsAdminSession();

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
    clearCmsAdminSession();
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
