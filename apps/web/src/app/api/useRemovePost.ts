import { useMutation, useQueryClient } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";

const removePost = async (id: string) => {
  return api.delete(`/posts/${id}`);
};

export const useRemovePost = () => {
  const queryClient = useQueryClient();
  return useMutation(removePost, {
    onSuccess: () => {
      toast.success("Eksponat maknut", {
        icon: "👋",
        id: "post_removal_success",
      });
      queryClient.invalidateQueries("posts");
    },
    onError: (error) => {
      if (error === "Unauthorized") {
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
