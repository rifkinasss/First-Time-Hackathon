const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const API_BASE_URL = API_ORIGIN.endsWith("/api/v1") ? API_ORIGIN : `${API_ORIGIN}/api/v1`;

function getErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const payload = body as { message?: unknown; detail?: unknown };
  const detail = payload.message ?? payload.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((item) => {
    if (typeof item === "string") return item;
    if (item && typeof item === "object") {
      const validation = item as { msg?: unknown; loc?: unknown };
      const field = Array.isArray(validation.loc) ? validation.loc.filter((part) => part !== "body").join(".") : "";
      const message = typeof validation.msg === "string" ? validation.msg : "Input tidak valid";
      return field ? `${field}: ${message}` : message;
    }
    return "Input tidak valid";
  }).join(". ") || fallback;
  if (detail && typeof detail === "object" && typeof (detail as { message?: unknown }).message === "string") return (detail as { message: string }).message;
  return fallback;
}

export async function requestData<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: { "Content-Type": "application/json", ...options.headers }, cache: "no-store" });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(getErrorMessage(body, `API request failed: ${response.status} ${path}`));
  return (body && Object.prototype.hasOwnProperty.call(body, "data") ? body.data : body) as T;
}

export const fetchData = <T>(path: string) => requestData<T>(path);
