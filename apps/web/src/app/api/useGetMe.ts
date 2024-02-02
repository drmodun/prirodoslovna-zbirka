import { useQuery } from "react-query";
import { api } from "./shared";
import { ExtendedUserResponse } from "@biosfera/types";

const getMe = () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return Promise.reject("No token");
  }
  const response = api.get<never, ExtendedUserResponse>("/auth/detailed", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
};
export const useGetMe = () => {
  return useQuery(["me"], getMe, {
    onError: (error: string) => {
      console.log(error);
      if (localStorage.getItem("access_token") === null) return;
      localStorage.removeItem("access_token");
      localStorage.removeItem("loggedTime");
      window.location.href = "/login";
    },
  });
};
