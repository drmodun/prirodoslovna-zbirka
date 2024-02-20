import { useMutation, useQueryClient } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";

const removeExponat = async (id: string) => {
  return api.delete(`/exponats/${id}`);
};

export const useRemoveExponat = () => {
  const queryClient = useQueryClient();
  return useMutation(removeExponat, {
    onSuccess: () => {
      toast.success("Eksponat maknut", {
        icon: "👋",
        id: "exponat_removal_success",
      });
      queryClient.invalidateQueries("exponats");
    },
    onError: (error: string) => {
      if (
        error === "Unauthorized" ||
        error.includes("Unauthorized") ||
        error.includes("You")
      ) {
        toast.error("Morate biti admin da biste uklonili eksponat", {
          icon: "🔒",
          id: "unauthorized",
        });
      } else {
        toast.error("Došlo je do greške, molimo pokušajte kasnije", {
          icon: "🚨",
          id: "error",
        });
      }
    },
  });
};
