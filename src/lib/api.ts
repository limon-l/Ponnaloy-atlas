/**
 * API transport for live mode.
 *
 * Demo mode never calls this module. Live mode maps onto the verified
 * Ponnaloy Fastify routes (`/api/products`, `/api/orders`, `/api/auth/*`).
 * The bearer token is held in sessionStorage rather than localStorage to
 * narrow the XSS persistence window; production should move to httpOnly
 * cookies at the API edge (documented limitation).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
export const DATA_MODE = process.env.NEXT_PUBLIC_ATLAS_DATA_MODE === "live" ? "live" : "demo";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function token(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem("ponnaloy.token");
}

export function setToken(value: string | null) {
  if (typeof window === "undefined") return;
  if (value) window.sessionStorage.setItem("ponnaloy.token", value);
  else window.sessionStorage.removeItem("ponnaloy.token");
}

export async function request<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const { json, headers, ...rest } = init;
  const bearer = token();
  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    credentials: "include",
  });

  const payload = (await response.json().catch(() => ({}))) as {
    data?: T;
    error?: string;
    message?: string;
    code?: string;
  };

  if (!response.ok) {
    throw new ApiError(payload.error ?? payload.message ?? "Request failed", response.status, payload.code);
  }
  return (payload.data ?? payload) as T;
}

export const liveApi = {
  products: () => request<unknown>("/api/products?limit=100"),
  product: (slug: string) => request<unknown>(`/api/products/${encodeURIComponent(slug)}`),
  categories: () => request<unknown>("/api/categories"),
  sellers: () => request<unknown>("/api/sellers"),
  orders: () => request<unknown>("/api/orders"),
  order: (id: string) => request<unknown>(`/api/orders/${encodeURIComponent(id)}`),
  signIn: (email: string, password: string) =>
    request<{ token: string; id: string; email: string; role: string }>("/api/auth/sign-in", {
      method: "POST",
      json: { email, password },
    }),
};
