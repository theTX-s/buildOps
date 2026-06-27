export { FetchError } from "./errors";
export { auth, configureFetcher, Fetcher } from "./fetcher";
export { buildIdentity, normalizeKey, stableStringify } from "./keys";
export { Store as queryCache } from "./store";
export { useFetcher } from "./useFetcher";
export { useMutation } from "./useMutation";

export type {
  HttpMethod,
  QueryKey,
  QueryState,
  QueryStatus,
  UseFetcherConfig,
  UseFetcherResult,
} from "./interface";
