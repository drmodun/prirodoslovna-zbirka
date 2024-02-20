import { useMutation, useQueryClient } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";

const leaveMembership = async (id: string) => {
  return api.delete(`/memberships/${id}`);
};

export const useLeaveMembership = () => {
  const queryClient = useQueryClient();
  return useMutation(leaveMembership, {
    onSuccess: () => {
      toast.success("Eksponat maknut", {
        icon: "👋",
        id: "membership_removal_success",
      });
      queryClient.invalidateQueries("memberships");
    },
    onError: (error) => {
      if (error === "Unauthorized") {
        toast.error("Neispravna autorizacija", {
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
