import { NotificationResponse } from "@biosfera/types";
import { api } from "./shared";
import { useQuery } from "react-query";

export const getNotifications = async () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return Promise.reject("No token");
  }

  const response = await api.get<never, NotificationResponse[]>(
    "/notification-users",
  );
  return response;
};

export const useGetNotifications = () => {
  return useQuery("notifications", getNotifications);
};
