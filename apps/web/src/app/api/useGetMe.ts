import { useQuery } from "react-query";
import { api } from "./shared";
import { ExtendedUserResponse } from "@biosfera/types";

const getMe = () => api.get<never, ExtendedUserResponse>("/users/detailed");

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
