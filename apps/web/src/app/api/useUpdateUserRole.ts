import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";

const updateUserRole = async (params: {
  organisationId: string;
  userId: string;
  role: string;
}) => {
  return await api.patch(`/members/${params.organisationId}/${params.userId}`, {
    role: params.role,
  });
};

export const useUpdateUserRole = () => {
  return useMutation(updateUserRole, {
    onSuccess: () => {
      toast.success("Uspješno promijenjenja uloga korisnika", {
        id: "update-user-role",
        icon: "👏",
      });
    },
    onError: (error) => {
      toast.error("Greška sa mijenanjem uloge", {
        id: "update-user-role",
        icon: "👏",
      });
    },
  });
};
