import { getCmsApiBaseUrl } from "@/lib/api";

export const ADMIN_DEMO_EMAIL = "admin@heureux.local";

export type AdminLoginResult =
  | { ok: true; token: string; admin: { id: number; email: string; name: string | null } }
  | { ok: false; field?: "email" | "password"; message: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateAdminLoginFields(
  email: string,
  password: string,
): AdminLoginResult | null {
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

  return null;
}

export async function loginAdmin(email: string, password: string): Promise<AdminLoginResult> {
  const validationError = validateAdminLoginFields(email, password);
  if (validationError) {
    return validationError;
  }

  try {
    const response = await fetch(`${getCmsApiBaseUrl()}/auth/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });

    const data = (await response.json().catch(() => null)) as
      | {
          ok?: boolean;
          message?: string;
          token?: string;
          admin?: { id: number; email: string; name: string | null };
        }
      | null;

    if (!response.ok || !data?.ok || !data.token || !data.admin) {
      return {
        ok: false,
        message: data?.message || "管理員登入失敗，請稍後再試。",
      };
    }

    return { ok: true, token: data.token, admin: data.admin };
  } catch {
    return {
      ok: false,
      message: "無法連線到後端管理員登入 API。",
    };
  }
}
