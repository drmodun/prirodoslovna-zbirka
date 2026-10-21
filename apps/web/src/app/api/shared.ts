"use client";

import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import toast from "react-hot-toast";
import { publicApiUrl } from "./getUrlServer";
import { readLocaleCookie } from "i18n/config";

export const baseURL = publicApiUrl;

export const api = axios.create({
  baseURL: baseURL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fileApi = axios.create({
  baseURL: baseURL,
  timeout: 5000,
});

const withHeaders = (config: InternalAxiosRequestConfig) => {
  // The API answers its error messages in this language.
  config.headers["Accept-Language"] = readLocaleCookie();
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(withHeaders);
// Uploads need a login too.
fileApi.interceptors.request.use(withHeaders);

type ErrorResponse = AxiosError & {
  response: AxiosResponse<{ message: string }>;
};

api.interceptors.response.use(
  (response) => response.data,

  (error: ErrorResponse) => {
    if (error.status === 401) {
      toast.error(
        error.response.data.message ||
          error.message ||
          (readLocaleCookie() === "hr"
            ? "Pristup odbijen"
            : "Forbidden access"),
      );
    }
    return Promise.reject(error.response?.data?.message || error.message);
  },
);
