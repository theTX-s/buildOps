export function StringifyJson(json: unknown): string {
  return btoa(SortJson(json))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function SortJson(value: unknown): string {
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
