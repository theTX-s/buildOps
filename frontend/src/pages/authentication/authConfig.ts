import { Store } from "../../utils/api/store";

const ENV =
  (import.meta as unknown as { env?: Record<string, string> }).env ?? {};

const config = {
  baseUrl: ENV.VITE_API_BASE_URL ?? "",
  refreshEndpoint: "/api/auth/refresh",
  logInEndpoint: "/api/auth/login",
  onAuthFailure: (): void => {
    Store.token.clear();
    if (typeof window !== "undefined") {
      // redirect to log in page
      console.warn("[fetcher] session expired — redirect to login");
    }
  },
};

export default config;