import { useMutation, useQueryClient } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";

const removeMembership = async (params: {
  organisationId: string;
  userId: string;
}) => {
  return api.delete(`/members/${params.organisationId}/${params.userId}`);
};

export const useRemoveMembership = () => {
  const queryClient = useQueryClient();
  return useMutation(removeMembership, {
    onSuccess: () => {
      toast.success("Članstvo ukinuto", {
        icon: "👋",
        id: "membership_removal_success",
      });
      queryClient.invalidateQueries("memberships");
    },
    onError: (error: string) => {
      if (
        error === "Unauthorized" ||
        error.includes("Unauthorized") ||
        error.includes("You")
      ) {
        toast.error("Morate biti admin da biste uklonili clanstvo", {
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
