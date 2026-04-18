import axios, { type InternalAxiosRequestConfig } from "axios";

import { publicApiBaseUrl, publicAppKey } from "@/lib/publicEnv";

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

export default axiosInstance;
