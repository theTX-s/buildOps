import { FetchError } from "./errors";
import { Store } from "./store";

const ENV =
  (import.meta as unknown as { env?: Record<string, string> }).env ?? {};

const config = {
  baseUrl: ENV.VITE_API_BASE_URL ?? "",
  refreshEndpoint: "/api/auth/refresh",
  logInEndpoint: "/api/auth/login",
  onAuthFailure: (): void => {
    Store.token.clear();
    if (typeof window !== "undefined") {
      // window.location.assign("/login");
      console.warn("[fetcher] session expired — redirect to login");
    }
  },
};

export function configureFetcher(patch: Partial<typeof config>): void {
  Object.assign(config, patch);
}

async function extractToken(res: Response): Promise<string | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    const json = JSON.parse(text) as Record<string, unknown>;
    const candidate =
      json.accessToken ?? json.access_token ?? json.token ?? json.jwt;
    return typeof candidate === "string" ? candidate : null;
  } catch {
    return text.trim();
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function runRefresh(): Promise<boolean> {
  const res = await fetch(config.baseUrl + config.refreshEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) return false;
  const newToken = await extractToken(res);
  if (!newToken) return false;
  Store.token.set(newToken);
  return true;
}

function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = runRefresh()
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function applyRequestHeaders(options: RequestInit): RequestInit {
  const headers = new Headers(options.headers ?? {});
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = Store.token.get();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return { ...options, headers, credentials: "include" };
}

async function parseResponse(res: Response): Promise<unknown> {
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    if (!res.ok) {
      throw new FetchError(`Request failed (${res.status})`, res.status, null);
    }
    return null;
  }

  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const message =
      body &&
      typeof body === "object" &&
      "message" in body &&
      typeof (body as { message: unknown }).message === "string"
        ? (body as { message: string }).message
        : `Request failed (${res.status})`;
    throw new FetchError(message, res.status, body);
  }
  return body;
}

async function baseRequest(
  endpoint: string,
  options: RequestInit,
  allowRetry = true,
): Promise<unknown> {
  const requestConfig = applyRequestHeaders(options);

  let res: Response;
  try {
    res = await fetch(config.baseUrl + endpoint, requestConfig);
  } catch (networkErr) {
    throw new FetchError(
      networkErr instanceof Error ? networkErr.message : "Network error",
      0,
      null,
    );
  }

  if (
    res.status === 401 &&
    allowRetry &&
    endpoint !== config.refreshEndpoint &&
    endpoint !== config.logInEndpoint
  ) {
    console.log(endpoint);

    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return baseRequest(endpoint, options, false);
    }
    config.onAuthFailure();
    throw new FetchError("Unauthorized", 401, null);
  }

  return parseResponse(res);
}

function buildUrl(endpoint: string, query?: Record<string, unknown>): string {
  if (!query) return endpoint;
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    usp.set(
      key,
      typeof value === "object" ? JSON.stringify(value) : String(value),
    );
  }
  const qs = usp.toString();
  return qs ? `${endpoint}?${qs}` : endpoint;
}

function Get(
  endpoint: string,
  query?: Record<string, unknown>,
  options: RequestInit = {},
): Promise<unknown> {
  return baseRequest(buildUrl(endpoint, query), { ...options, method: "GET" });
}

function withBody(
  method: "POST" | "PUT" | "PATCH",
  endpoint: string,
  body?: unknown,
  options: RequestInit = {},
): Promise<unknown> {
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  return baseRequest(endpoint, {
    ...options,
    method,
    body: isFormData ? body : JSON.stringify(body ?? null),
  });
}

const Post = (e: string, b?: unknown, o: RequestInit = {}) =>
  withBody("POST", e, b, o);
const Put = (e: string, b?: unknown, o: RequestInit = {}) =>
  withBody("PUT", e, b, o);
const Patch = (e: string, b?: unknown, o: RequestInit = {}) =>
  withBody("PATCH", e, b, o);
const Delete = (e: string, o: RequestInit = {}) =>
  baseRequest(e, { ...o, method: "DELETE" });

export const Fetcher = Object.freeze({ Get, Post, Put, Patch, Delete });

export const auth = Object.freeze({
  getAccessToken: Store.token.get,
  setAccessToken: Store.token.set,
  clearAccessToken: Store.token.clear,
  logout: (): void => {
    Store.token.clear();
    Store.clear();
  },
});
