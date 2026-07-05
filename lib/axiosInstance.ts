import axios, { type InternalAxiosRequestConfig } from "axios";

import { publicApiBaseUrl, publicAppKey } from "@/lib/publicEnv";
import {
  handleSessionReplacedClient,
  isSessionReplaced,
} from "@/lib/sessionReplaced";

const axiosInstance = axios.create({
  baseURL: publicApiBaseUrl,
});

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.headers = config.headers ?? {};
  const headers = config.headers as Record<string, string | undefined>;
  if (publicAppKey) {
    headers["app-key"] = publicAppKey;
  }
  if (!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (typeof window !== "undefined") {
      const status = error.response?.status;
      const data = error.response?.data;
      if (isSessionReplaced(status, data)) {
        await handleSessionReplacedClient(data.message);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
