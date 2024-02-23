import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";

const deleteUser = async (id: string) => {
  await api.delete(`/users/${id}`);
};

export const useDeleteUser = () => {
  return useMutation(deleteUser, {
    onError: (error) => {
      toast.error("Greška pri brisanju korisnika", { id: "delete-user" });
    },
    onSuccess: () => {
      toast.success("Korisnik obrisan", {
        id: "delete-user",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    },
  });
};
