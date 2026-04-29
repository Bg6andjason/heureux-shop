"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60,
  path: "/",
};

export interface AuthUser {
  id: number;
  email: string;
  name: string | null;
}

export interface AuthProfile extends AuthUser {
  created_at: string;
  email_verified: boolean;
  phone_verified: boolean;
  member_level: string;
  points: number;
  coupons: number;
  wishlist_count: number;
  cart_count: number;
  order_count: number;
  total_spent: number;
  default_address: string | null;
  payment_methods: number;
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string" || !email.trim()) {
    return { ok: false, message: "請填寫 email 與密碼" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) return { ok: false, message: "API 未設定" };

  const res = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
  });
  const data = (await res.json()) as {
    ok?: boolean;
    message?: string;
    token?: string;
    user?: AuthUser;
  };

  if (!res.ok || !data.ok || !data.token || !data.user) {
    return { ok: false, message: data.message ?? "登入失敗" };
  }

  const c = await cookies();
  c.set("auth_token", data.token, COOKIE_OPTIONS);
  c.set("auth_user_id", String(data.user.id), COOKIE_OPTIONS);
  c.set("auth_user_name", data.user.name ?? "", COOKIE_OPTIONS);
  c.set("auth_user_email", data.user.email, COOKIE_OPTIONS);
  const from = formData.get("from");
  const path =
    typeof from === "string" && /^\/cart$|^\/orders|^\/account/.test(from)
      ? from
      : "/";
  redirect(path);
}

export async function registerAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const name = formData.get("name");
  if (typeof email !== "string" || typeof password !== "string" || !email.trim()) {
    return { ok: false, message: "請填寫 email 與密碼" };
  }
  if (password.length < 6) {
    return { ok: false, message: "密碼至少 6 碼" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) return { ok: false, message: "API 未設定" };

  const res = await fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.trim(),
      password,
      name: typeof name === "string" ? name.trim() || undefined : undefined,
    }),
  });
  const data = (await res.json()) as {
    ok?: boolean;
    message?: string;
    token?: string;
    user?: AuthUser;
  };

  if (!res.ok || !data.ok || !data.token || !data.user) {
    return { ok: false, message: data.message ?? "註冊失敗" };
  }

  const c = await cookies();
  c.set("auth_token", data.token, COOKIE_OPTIONS);
  c.set("auth_user_id", String(data.user.id), COOKIE_OPTIONS);
  c.set("auth_user_name", data.user.name ?? "", COOKIE_OPTIONS);
  c.set("auth_user_email", data.user.email, COOKIE_OPTIONS);
  redirect("/");
}

export async function logoutAction() {
  const c = await cookies();
  c.delete("auth_token");
  c.delete("auth_user_id");
  c.delete("auth_user_name");
  c.delete("auth_user_email");
  redirect("/");
}

/** 在 Server Component / Server Action 中取得目前登入者 id，未登入回傳 null */
export async function getAuthUserId(): Promise<number | null> {
  const c = await cookies();
  const id = c.get("auth_user_id")?.value;
  if (!id) return null;
  const n = parseInt(id, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** 取得登入者顯示名稱（用於 Navbar） */
export async function getAuthDisplayName(): Promise<string | null> {
  const c = await cookies();
  const name = c.get("auth_user_name")?.value;
  return name ?? null;
}

export async function getAuthEmail(): Promise<string | null> {
  const c = await cookies();
  const email = c.get("auth_user_email")?.value;
  return email ?? null;
}

export async function getAuthProfile(): Promise<AuthProfile | null> {
  const userId = await getAuthUserId();
  if (userId === null) return null;

  const fallbackProfile = async (): Promise<AuthProfile> => {
    const name = await getAuthDisplayName();
    const email = await getAuthEmail();
    return {
      id: userId,
      email: email ?? "",
      name,
      created_at: new Date().toISOString(),
      email_verified: Boolean(email),
      phone_verified: false,
      member_level: "Basic",
      points: 0,
      coupons: 0,
      wishlist_count: 0,
      cart_count: 0,
      order_count: 0,
      total_spent: 0,
      default_address: null,
      payment_methods: 0,
    };
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) return fallbackProfile();

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/auth/profile?user_id=${userId}`, {
      cache: "no-store",
    });
  } catch {
    return fallbackProfile();
  }
  if (!res.ok) return fallbackProfile();

  const body = (await res.json()) as { ok?: boolean; user?: AuthProfile };
  return body.ok && body.user ? body.user : fallbackProfile();
}
