import { useEffect, useState } from "react";
import GlobalCache from "./cache";
import Fetcher from "./fetcher";
import type { FetchError, UseFetcherResponse } from "./interface";

const useFetcher = <T>(
  method: "GET" | "POST",
  url: string,
  params: unknown,
  options: RequestInit,
): UseFetcherResponse<T> => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FetchError | null>(null);
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);

      const cachedData = GlobalCache.GetAPICache(method, url, params);
      if (cachedData) {
        if (isMounted) {
          setData(cachedData.data as T);
          setIsLoading(false);
          setError(null);
        }
        return;
      }

      let requestPromise = GlobalCache.GetInFlight(method, url, params);

      if (!requestPromise) {
        switch (method) {
          case "GET":
            requestPromise = Fetcher.Get(url, options);
            break;
          case "POST":
            requestPromise = Fetcher.Post(url, params, options);
            break;
          default:
            requestPromise = Promise.reject(new Error("Unsupported method"));
        }

        GlobalCache.SetInFlight(method, url, params, requestPromise);

        requestPromise
          .then((res) => {
            GlobalCache.SetAPICache(method, url, params, res);
          })
          .finally(() => {
            GlobalCache.RemoveInFlight(method, url, params);
          });
      }

      try {
        const result = await requestPromise;

        if (isMounted) {
          setData(result as T);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as FetchError);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [method, url, options, params]);

  return { isLoading, error, data };
};

export default useFetcher;
