import type { FetchError } from "./errors";
import type { QueryKey, QueryState } from "./interface";
import { keyMatchesFilter, normalizeKey } from "./keys";

type Listener = () => void;

const EMPTY_STATE: QueryState<unknown> = Object.freeze({
  data: null,
  error: null,
  status: "pending",
  isFetching: false,
  updatedAt: 0,
});

interface Entry {
  keyParts: readonly unknown[];
  state: QueryState<unknown>;
  listeners: Set<Listener>;
  inFlight: Promise<unknown> | null;
  refetch: (() => Promise<void>) | null;
  gcTimer: ReturnType<typeof setTimeout> | null;
  gcTime: number;
}

interface FetchOptions {
  staleTime: number;
  gcTime: number;
  force: boolean;
}

const DEFAULT_GC_TIME = 5 * 60_000;
const entries = new Map<string, Entry>();

function getOrCreate(identity: string, keyParts: readonly unknown[]): Entry {
  let entry = entries.get(identity);
  if (!entry) {
    entry = {
      keyParts,
      state: EMPTY_STATE,
      listeners: new Set(),
      inFlight: null,
      refetch: null,
      gcTimer: null,
      gcTime: DEFAULT_GC_TIME,
    };
    entries.set(identity, entry);
  }
  return entry;
}

function notify(entry: Entry): void {
  for (const listener of entry.listeners) listener();
}

function commit(entry: Entry, next: QueryState<unknown>): void {
  entry.state = next;
  notify(entry);
}

function scheduleGc(identity: string, entry: Entry): void {
  if (entry.gcTimer) clearTimeout(entry.gcTimer);
  entry.gcTimer = setTimeout(() => {
    const current = entries.get(identity);
    if (current && current.listeners.size === 0) entries.delete(identity);
  }, entry.gcTime);
}

function subscribe(
  identity: string,
  keyParts: readonly unknown[],
  listener: Listener,
): () => void {
  const entry = getOrCreate(identity, keyParts);
  if (entry.gcTimer) {
    clearTimeout(entry.gcTimer);
    entry.gcTimer = null;
  }
  entry.listeners.add(listener);
  return () => {
    entry.listeners.delete(listener);
    if (entry.listeners.size === 0) scheduleGc(identity, entry);
  };
}

function getSnapshot<T>(identity: string): QueryState<T> {
  const entry = entries.get(identity);
  return (entry ? entry.state : EMPTY_STATE) as QueryState<T>;
}

function getServerSnapshot<T>(): QueryState<T> {
  return EMPTY_STATE as QueryState<T>;
}

async function fetchQuery(
  identity: string,
  keyParts: readonly unknown[],
  fetcher: () => Promise<unknown>,
  opts: FetchOptions,
): Promise<void> {
  const entry = getOrCreate(identity, keyParts);
  entry.gcTime = opts.gcTime;
  entry.refetch = () =>
    fetchQuery(identity, keyParts, fetcher, { ...opts, force: true });

  if (entry.inFlight) {
    return entry.inFlight.then(
      () => undefined,
      () => undefined,
    );
  }

  const hasData = entry.state.status === "success";
  const age = Date.now() - entry.state.updatedAt;
  if (!opts.force && hasData && age < opts.staleTime) return;

  commit(entry, { ...entry.state, isFetching: true });

  const promise = fetcher();
  entry.inFlight = promise;

  try {
    const data = await promise;
    commit(entry, {
      data,
      error: null,
      status: "success",
      isFetching: false,
      updatedAt: Date.now(),
    });
  } catch (err) {
    commit(entry, {
      ...entry.state,
      error: err as FetchError,
      status: "error",
      isFetching: false,
    });
  } finally {
    entry.inFlight = null;
  }
}

function invalidate(filter: QueryKey): void {
  const f = normalizeKey(filter);
  for (const entry of entries.values()) {
    if (!keyMatchesFilter(entry.keyParts, f)) continue;
    entry.state = { ...entry.state, updatedAt: 0 }; // force-stale
    if (entry.listeners.size > 0 && entry.refetch) {
      void entry.refetch();
    } else {
      notify(entry);
    }
  }
}

function setData<T>(
  identity: string,
  keyParts: readonly unknown[],
  updater: T | ((prev: T | null) => T),
): void {
  const entry = getOrCreate(identity, keyParts);
  const prev = entry.state.data as T | null;
  const next =
    typeof updater === "function"
      ? (updater as (p: T | null) => T)(prev)
      : updater;
  commit(entry, {
    ...entry.state,
    data: next,
    error: null,
    status: "success",
    updatedAt: Date.now(),
  });
}

function clear(): void {
  for (const entry of entries.values()) {
    if (entry.gcTimer) clearTimeout(entry.gcTimer);
  }
  entries.clear();
}

let accessToken: string | null = null;
const token = Object.freeze({
  get: (): string | null => accessToken,
  set: (value: string | null): void => {
    accessToken = value;
  },
  clear: (): void => {
    accessToken = null;
  },
});

export const Store = Object.freeze({
  subscribe,
  getSnapshot,
  getServerSnapshot,
  fetchQuery,
  invalidate,
  setData,
  clear,
  token,
});
