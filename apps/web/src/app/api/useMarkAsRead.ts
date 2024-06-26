import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";

export const markAsRead = async (id: string) => {
  await api.patch(`/notification-users/read/${id}`);
};

export const useMarkAsRead = () => {
  return useMutation(markAsRead, {
    onMutate: (id: string) => {
      return { id };
    },
    onError: (error: string, variables, context) => {
      console.error(error);
      toast.error("Greška pri označavanju obavijesti kao pročitane");
    },
  });
};
