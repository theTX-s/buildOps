import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { FetchError } from "./errors";
import { Fetcher } from "./fetcher";
import type {
  QueryKey,
  QueryState,
  UseFetcherConfig,
  UseFetcherResult,
} from "./interface";
import { buildIdentity, normalizeKey } from "./keys";
import { Store } from "./store";

const isDev = Boolean(
  (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV,
);

export function useFetcher<T, S = T>(
  key: QueryKey,
  config: UseFetcherConfig<T, S>,
): UseFetcherResult<S> {
  const {
    method = "GET",
    url,
    query,
    body,
    options,
    staleTime = 0,
    gcTime = 5 * 60_000,
    enabled = true,
    cache,
    select,
  } = config;

  const shouldCache = cache ?? method === "GET";

  const params = method === "GET" ? query : body;
  const identity = buildIdentity(key, method, url, params);

  if (isDev && method !== "GET" && cache === undefined) {
    console.warn(
      `[useFetcher] "${method} ${url}" is a write — prefer useMutation. ` +
        `It will run on every mount and won't be cached.`,
    );
  }

  const reqRef = useRef({ method, url, query, body, options });
  reqRef.current = { method, url, query, body, options };

  const runFetcher = useCallback((): Promise<unknown> => {
    const r = reqRef.current;
    switch (r.method) {
      case "GET":
        return Fetcher.Get(r.url, r.query, r.options);
      case "POST":
        return Fetcher.Post(r.url, r.body, r.options);
      case "PUT":
        return Fetcher.Put(r.url, r.body, r.options);
      case "PATCH":
        return Fetcher.Patch(r.url, r.body, r.options);
      case "DELETE":
        return Fetcher.Delete(r.url, r.options);
      default:
        return Promise.reject(
          new FetchError(`Unsupported method ${String(r.method)}`, 0, null),
        );
    }
  }, []);

  const subscribe = useCallback(
    (listener: () => void) =>
      Store.subscribe(identity, normalizeKey(key), listener),
    [identity],
  );
  const getSnapshot = useCallback(
    () => Store.getSnapshot<T>(identity),
    [identity],
  );

  const state = useSyncExternalStore<QueryState<T>>(
    subscribe,
    getSnapshot,
    Store.getServerSnapshot as () => QueryState<T>,
  );

  useEffect(() => {
    if (!enabled) return;
    void Store.fetchQuery(identity, normalizeKey(key), runFetcher, {
      staleTime,
      gcTime,
      force: !shouldCache,
    });
  }, [identity, enabled, staleTime, gcTime, shouldCache, runFetcher]);

  const load = useCallback(
    () =>
      Store.fetchQuery(identity, normalizeKey(key), runFetcher, {
        staleTime,
        gcTime,
        force: false,
      }),
    [identity, staleTime, gcTime, runFetcher],
  );

  const refetch = useCallback(
    () =>
      Store.fetchQuery(identity, normalizeKey(key), runFetcher, {
        staleTime: 0,
        gcTime,
        force: true,
      }),
    [identity, gcTime, runFetcher],
  );

  const projected = useMemo<S | null>(() => {
    if (state.data == null) return null;
    return select ? select(state.data) : (state.data as unknown as S);
  }, [state.data]);

  return {
    data: projected,
    error: state.error,
    isLoading: enabled && state.status === "pending",
    isFetching: state.isFetching,
    isError: state.status === "error",
    isSuccess: state.status === "success",
    load,
    refetch,
  };
}

export default useFetcher;
