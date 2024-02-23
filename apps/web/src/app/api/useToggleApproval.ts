import toast from "react-hot-toast";
import { api } from "./shared";
import { QueryClient, useMutation } from "react-query";

const toggleApproval = async (params: { id: string; entity: string }) =>
  api.patch(`/${params.entity}/${params.id}/approval`);

export const useToggleApproval = () => {
  return useMutation(toggleApproval, {
    onError: (error: string) => {
      if (
        error === "Unauthorized" ||
        error.includes("Unauthorized") ||
        error.includes("You")
      ) {
        toast.error("Morate biti admin da biste utjecali na vizibilitet", {
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
