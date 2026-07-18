import { getRefreshToken } from "../../pages/authentication/AuthApis";
import config from "../../pages/authentication/authConfig";
import { FetchError } from "./errors";
import { Store } from "./store";

export function configureFetcher(patch: Partial<typeof config>): void {
  Object.assign(config, patch);
}

let refreshPromise: Promise<boolean> | null = null;

function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = getRefreshToken()
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
