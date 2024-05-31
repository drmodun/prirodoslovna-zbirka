import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";

export const markAllAsRead = async () => {
  await api.patch(`/notification-users/read/all`);
};

export const useMarkAllAsRead = () => {
  return useMutation(markAllAsRead, {
    onError: (error: string) => {
      console.error(error);
      toast.error("Greška pri označavanju obavijesti kao pročitane");
    },
  });
};
