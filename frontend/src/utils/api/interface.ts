export interface CacheEntry<T> {
  data: T;
  timeStamp: number;
}

export interface FetchError {
  statusCode: number;
  message: number;
}

export interface UseFetcherResponse<T = unknown> {
  isLoading: boolean;
  error: FetchError | null;
  data: T | null;
}
