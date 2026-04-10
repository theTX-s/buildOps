import type { CacheEntry } from "./interface";

const cache = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

function CreateRequestCache() {
  function GenerateUniqueKey(
    method: string,
    url: string,
    params: unknown,
  ): string {
    const base64UrlEncoded = btoa(SortJson(params))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    return `${method}_${url}_${base64UrlEncoded}`;
  }

  function SortJson(value: unknown): string {
    const seen = new WeakSet();
    return JSON.stringify(value, function (_key, val) {
      if (val && typeof val === "object") {
        if (seen.has(val)) return "__cycle";
        seen.add(val);
      }
      if (val instanceof Date) return val.toISOString();
      if (typeof val === "undefined") return "__undefined";

      if (val && typeof val === "object" && !Array.isArray(val)) {
        return Object.keys(val)
          .sort()
          .reduce(
            (acc, key) => {
              acc[key] = (val as Record<string, unknown>)[key];
              return acc;
            },
            {} as Record<string, unknown>,
          );
      }
      return val;
    });
  }

  function GetCache(key:string) {
    return cache.has(key) ? cache.get(key) : null;
  }

  function SetCache(
    key: string,
    data: unknown,
  ) {
    cache.set(key, {
      data,
      timeStamp: new Date().getTime(),
    });
  }

  function GetAPICache(method: string, url: string, params: unknown) {
    const key = GenerateUniqueKey(method, url, params);
    return cache.has(key) ? cache.get(key) : null;
  }

  function SetAPICache(
    method: string,
    url: string,
    params: unknown,
    data: unknown,
  ) {
    const key = GenerateUniqueKey(method, url, params);
    cache.set(key, {
      data,
      timeStamp: new Date().getTime(),
    });
  }

  function GetInFlight(method: string, url: string, params: unknown) {
    const key = GenerateUniqueKey(method, url, params);
    return inFlight.has(key) ? inFlight.get(key) : null;
  }

  function SetInFlight(
    method: string,
    url: string,
    params: unknown,
    data: Promise<unknown>,
  ) {
    const key = GenerateUniqueKey(method, url, params);
    return inFlight.set(key, data);
  }

  function RemoveInFlight(method: string, url: string, params: unknown) {
    const key = GenerateUniqueKey(method, url, params);
    return inFlight.delete(key);
  }
  return Object.freeze({
    GetCache,
    SetCache,
    GetAPICache,
    SetAPICache,
    GetInFlight,
    SetInFlight,
    RemoveInFlight,
  });
}

const GlobalCache = CreateRequestCache();
export default GlobalCache;
