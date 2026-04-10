import GlobalCache from "./cache";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const ACCESS_TOKEN = "ACCESS_TOKEN";

const interceptor = {
  request: (config: RequestInit): RequestInit => {
    const headers = new Headers(config.headers || {});
    headers.set("Content-Type", "application/json");

    if (GlobalCache.GetCache(ACCESS_TOKEN)) {
      headers.set(
        "Authorization",
        `Bearer ${GlobalCache.GetCache(ACCESS_TOKEN)}`,
      );
    }
    return { ...config, headers };
  },

  response: async (response: Response) => {
    if (response.status === 401) {
      const headers = new Headers({});
      headers.set("Content-Type", "application/json");
      response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers,
        credentials: "include",
      });
      const data = await response.json().catch(() => {});
      if (response.ok) {
        GlobalCache.SetCache(ACCESS_TOKEN, data);
      } else {
        console.warn("redirect to log in page");
      }
    }
    return response;
  },
};

function CreateFetcher() {
  async function BaseRequest(endpoint: string, options: RequestInit = {}) {
    const config = interceptor.request(options);
    const url = BASE_URL + endpoint;
    try {
      const response = await fetch(url, config);

      await interceptor.response(response);

      const data = await response.json().catch(() => {});

      if (!response.ok) {
        console.warn("error occured", response.status);
        throw new Error(`API failed with reponse code ${response.status}`);
      }
      return data;
    } catch (error) {
      console.warn(error);
      throw new Error(`API failed with error ${error}`);
    }
  }

  function Get(url: string, options: RequestInit = {}) {
    return BaseRequest(url, { ...options, method: "GET" });
  }

  function Post(url: string, body: unknown, options: RequestInit = {}) {
    return BaseRequest(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  function Put(url: string, body: unknown, options: RequestInit = {}) {
    return BaseRequest(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  function Delete(url: string, options: RequestInit = {}) {
    return BaseRequest(url, { ...options, method: "DELETE" });
  }

  return Object.freeze({ Get, Post, Put, Delete });
}

const Fetcher = CreateFetcher();
export default Fetcher;
