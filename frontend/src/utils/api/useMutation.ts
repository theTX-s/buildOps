import { useCallback, useRef, useState } from "react";
import { FetchError } from "./errors";
import { Fetcher } from "./fetcher";
import type { HttpMethod, QueryKey } from "./interface";
import { Store } from "./store";

interface MutationConfig<TData, TVars> {
  method?: HttpMethod;
  url: string | ((vars: TVars) => string);
  mutationFn?: (vars: TVars) => Promise<TData>;
  invalidates?: QueryKey[];
  onSuccess?: (data: TData, vars: TVars) => void | Promise<void>;
  onError?: (error: FetchError, vars: TVars) => void;
  onSettled?: () => void;
}

interface MutationResult<TData, TVars> {
  mutate: (vars: TVars) => void;
  mutateAsync: (vars: TVars) => Promise<TData>;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: FetchError | null;
  data: TData | null;
  reset: () => void;
}

type Status = "idle" | "pending" | "success" | "error";

export function useMutation<TData = unknown, TVars = void>(
  config: MutationConfig<TData, TVars>,
): MutationResult<TData, TVars> {
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<FetchError | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const cfgRef = useRef(config);
  cfgRef.current = config;

  const mutateAsync = useCallback(async (vars: TVars): Promise<TData> => {
    const cfg = cfgRef.current;
    setStatus("pending");
    setError(null);
    try {
      let result: TData;
      if (cfg.mutationFn) {
        result = await cfg.mutationFn(vars);
      } else {
        const url = typeof cfg.url === "function" ? cfg.url(vars) : cfg.url;
        const method = cfg.method ?? "POST";
        switch (method) {
          case "POST":
            result = (await Fetcher.Post(url, vars)) as TData;
            break;
          case "PUT":
            result = (await Fetcher.Put(url, vars)) as TData;
            break;
          case "PATCH":
            result = (await Fetcher.Patch(url, vars)) as TData;
            break;
          case "DELETE":
            result = (await Fetcher.Delete(url)) as TData;
            break;
          case "GET":
            result = (await Fetcher.Get(url)) as TData;
            break;
          default:
            throw new FetchError(
              `Unsupported method ${String(method)}`,
              0,
              null,
            );
        }
      }

      setData(result);
      setStatus("success");
      cfg.invalidates?.forEach((k) => Store.invalidate(k));
      await cfg.onSuccess?.(result, vars);
      return result;
    } catch (err) {
      const fe =
        err instanceof FetchError ? err : new FetchError(String(err), 0, null);
      setError(fe);
      setStatus("error");
      cfg.onError?.(fe, vars);
      throw fe;
    } finally {
      cfg.onSettled?.();
    }
  }, []);

  const mutate = useCallback(
    (vars: TVars): void => {
      void mutateAsync(vars).catch(() => {});
    },
    [mutateAsync],
  );

  const reset = useCallback((): void => {
    setData(null);
    setError(null);
    setStatus("idle");
  }, []);

  return {
    mutate,
    mutateAsync,
    isPending: status === "pending",
    isError: status === "error",
    isSuccess: status === "success",
    error,
    data,
    reset,
  };
}

export default useMutation;
