import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";

const requestMembership = async (id: string) => {
  return await api.post(`/members/${id}`);
};

export const useRequestMembership = () => {
  return useMutation(requestMembership, {
    onSuccess: () => {
      toast.success("Zahtjev za članstvo je poslan", {
        icon: "🎉",
        id: "success",
      });
    },
    onError: (error: string) => {
      if (
        error === "Unauthorized" ||
        error.includes("Unauthorized") ||
        error.includes("You")
      ) {
        toast.error(
          "Morate biti logirani da biste poslali zahtjev za članstvo",
          {
            icon: "🔒",
            id: "unauthorized",
          },
        );
      } else {
        toast.error("Greška se dogodila, molim vas pokušajte kasnije", {
          icon: "🚨",
          id: "error",
        });
      }
    },
  });
};
