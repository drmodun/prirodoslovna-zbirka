import { NotificationResponse } from "@biosfera/types";
import { api } from "./shared";
import { useQuery } from "react-query";

export const getNotifications = async () => {
  const response = await api.get<never, NotificationResponse[]>(
    "/notifications"
  );
  return response;
};

export const useGetNotifications = () => {
  return useQuery("notifications", getNotifications);
};
