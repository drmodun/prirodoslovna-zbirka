import axios, { AxiosError, AxiosResponse } from "axios";
import toast from "react-hot-toast";

export const baseURL =
  process?.env?.NEXT_PUBLIC_DOCKER === "true"
    ? "http://api_container:5500"
    : "http://localhost:5500";

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

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type ErrorResponse = AxiosError & {
  response: AxiosResponse<{ message: string }>;
};

api.interceptors.response.use(
  (response) => response.data,

  (error: ErrorResponse) => {
    if (error.status === 401) {
      toast.error(
        error.response.data.message || error.message || "Forbbiden access"
      );
    }
    return Promise.reject(error.response?.data?.message || error.message);
  }
);
