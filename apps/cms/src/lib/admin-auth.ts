export const ADMIN_DEMO_EMAIL = "admin@heureux.local";
export const ADMIN_DEMO_PASSWORD = "heureux-admin";

export type AdminLoginResult =
  | { ok: true }
  | { ok: false; field?: "email" | "password"; message: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateAdminLogin(email: string, password: string): AdminLoginResult {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return { ok: false, field: "email", message: "請輸入 Email。" };
  }

  if (!emailPattern.test(normalizedEmail)) {
    return { ok: false, field: "email", message: "請輸入有效的 Email 格式。" };
  }

  if (!password) {
    return { ok: false, field: "password", message: "請輸入密碼。" };
  }

  if (password.length < 8) {
    return { ok: false, field: "password", message: "密碼至少需要 8 碼。" };
  }

  if (normalizedEmail !== ADMIN_DEMO_EMAIL || password !== ADMIN_DEMO_PASSWORD) {
    return { ok: false, message: "管理員帳號或密碼錯誤。" };
  }

  return { ok: true };
}
