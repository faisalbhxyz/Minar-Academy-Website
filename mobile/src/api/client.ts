import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import { apiBaseUrl, appKey } from "@/lib/env";
import { clearSession, getToken } from "@/lib/storage";
import type { SessionReplacedBody } from "@/types/api";

type SessionHandler = (message?: string) => void;

let onSessionReplaced: SessionHandler | null = null;

export function setSessionReplacedHandler(handler: SessionHandler): void {
  onSessionReplaced = handler;
}

export function isSessionReplaced(
  status: number,
  body: unknown
): body is SessionReplacedBody {
  if (status !== 401) return false;
  const data = body as SessionReplacedBody | null | undefined;
  return data?.code === "SESSION_REPLACED";
}

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  config.headers = config.headers ?? {};
  const headers = config.headers as Record<string, string | undefined>;

  if (appKey) {
    headers["app-key"] = appKey;
  }
  if (!headers["Content-Type"] && !(config.data instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const token = await getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;
    if (isSessionReplaced(status, data)) {
      await clearSession();
      onSessionReplaced?.((data as SessionReplacedBody).message);
    }
    return Promise.reject(error);
  }
);

export default api;
