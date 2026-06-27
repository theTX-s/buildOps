import type { QueryKey } from "./interface";

export function stableStringify(value: unknown): string {
  if (value === undefined) return "undefined";
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const body = Object.keys(obj)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`)
    .join(",");
  return `{${body}}`;
}

export function normalizeKey(key: QueryKey): readonly unknown[] {
  return Array.isArray(key) ? key : [key];
}

export function buildIdentity(
  key: QueryKey,
  method: string,
  url: string,
  params: unknown,
): string {
  return stableStringify([normalizeKey(key), method, url, params]);
}

export function keyMatchesFilter(
  entryKey: readonly unknown[],
  filter: readonly unknown[],
): boolean {
  if (filter.length > entryKey.length) return false;
  for (let i = 0; i < filter.length; i++) {
    if (stableStringify(entryKey[i]) !== stableStringify(filter[i])) {
      return false;
    }
  }
  return true;
}
