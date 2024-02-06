import { useQuery } from "react-query";
import { api } from "./shared";
import { ExtendedUserResponse } from "@biosfera/types";

const getMe = async () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return Promise.reject("No token");
  }
  const response = await api.get<never, ExtendedUserResponse>("/auth/detailed");
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
