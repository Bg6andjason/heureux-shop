export type CmsAdminSession = {
  email?: string;
  name?: string | null;
};

const adminTokenKey = "heureux-cms-admin-token";
const adminSessionKey = "heureux-cms-admin";

export const missingAdminSessionMessage = "請先登入 CMS 管理員帳號。";

export function getCmsAdminToken() {
  return window.sessionStorage.getItem(adminTokenKey);
}

export function getCmsAdminSession(): CmsAdminSession | null {
  const token = getCmsAdminToken();
  const rawAdmin = window.sessionStorage.getItem(adminSessionKey);

  if (!token || !rawAdmin) {
    return null;
  }

  try {
    return JSON.parse(rawAdmin) as CmsAdminSession;
  } catch {
    return null;
  }
}

export function setCmsAdminSession(token: string, admin: CmsAdminSession) {
  window.sessionStorage.setItem(adminTokenKey, token);
  window.sessionStorage.setItem(adminSessionKey, JSON.stringify(admin));
}

export function clearCmsAdminSession() {
  window.sessionStorage.removeItem(adminTokenKey);
  window.sessionStorage.removeItem(adminSessionKey);
}
