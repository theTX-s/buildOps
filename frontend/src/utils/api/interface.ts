import type { FetchError } from "./errors";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type QueryKey = string | readonly unknown[];

export type QueryStatus = "pending" | "success" | "error";

export interface QueryState<T = unknown> {
  data: T | null;
  error: FetchError | null;
  status: QueryStatus;
  isFetching: boolean;
  updatedAt: number;
}

export interface UseFetcherConfig<T, S = T> {
  method?: HttpMethod;
  url: string;
  query?: Record<string, unknown>;
  body?: unknown;
  options?: RequestInit;
  staleTime?: number;
  gcTime?: number;
  enabled?: boolean;
  cache?: boolean;
  select?: (data: T) => S;
}

export interface UseFetcherResult<S> {
  data: S | null;
  error: FetchError | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
  load: () => Promise<void>;
  refetch: () => Promise<void>;
}
