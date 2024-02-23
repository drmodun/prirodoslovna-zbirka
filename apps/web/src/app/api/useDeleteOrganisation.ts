import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";

const deleteOrganisation = async (id: string) => {
  await api.delete(`/organisations/${id}`);
};

export const useDeleteOrganisation = () => {
  return useMutation(deleteOrganisation, {
    onError: (error) => {
      toast.error("Greška pri brisanju organizacije", {
        id: "delete-organisation",
      });
    },
    onSuccess: () => {
      toast.success("Organizacija obrisana", {
        id: "delete-organisation",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    },
  });
};
