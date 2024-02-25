import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";

export const followOrganisation = async (organisationId: string) =>
  await api.patch(`/favourite-organisations/${organisationId}`);

export const useFollowOrganisation = () => {
  return useMutation(followOrganisation, {
    onSuccess: () => {
      toast.success("Promijenjen status praćenja", {
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
        toast.error("Morate biti logirani da pratite organizaciju", {
          icon: "🔒",
          id: "unauthorized",
        });
      } else {
        toast.error("Greška se dogodila, molim vas pokušajte kasnije", {
          icon: "🚨",
          id: "error",
        });
      }
    },
  });
};
