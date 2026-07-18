import { auth, Fetcher } from "../../utils/api/fetcher";
import { Store } from "../../utils/api/store";
import config from "./authConfig";

async function extractToken(res: Response): Promise<string | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    const json = JSON.parse(text) as Record<string, unknown>;
    const candidate =
      json.accessToken ?? json.access_token ?? json.token ?? json.jwt;
    return typeof candidate === "string" ? candidate : null;
  } catch {
    return text.trim();
  }
}

export async function getRefreshToken(): Promise<boolean> {
  const res = await fetch(config.baseUrl + config.refreshEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) return false;
  const newToken = await extractToken(res);
  if (!newToken) return false;
  Store.token.set(newToken);
  return true;
}

export async function logInUser({
  emailId,
  password,
}: {
  emailId: string;
  password: string;
}) {
  const data = (await Fetcher.Post("/api/auth/login", {
    emailId: emailId,
    password: password,
  })) as {
    accessToken: string;
  };
  if (!data) return false;
  auth.setAccessToken(data.accessToken ?? data);
  return true;
}

export async function logOutUser():Promise<boolean> {
  auth.logout();
  return await Fetcher.Get("/api/auth/logout") as boolean;
}
