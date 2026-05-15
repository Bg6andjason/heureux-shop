const defaultApiBaseUrl = "http://localhost:3001";

export function getCmsApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || defaultApiBaseUrl;
}
