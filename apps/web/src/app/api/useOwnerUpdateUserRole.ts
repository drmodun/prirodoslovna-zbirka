import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";

const ownerUpdateUserRole = async (params: {
  organisationId: string;
  userId: string;
  role: string;
}) => {
  return await api.post(
    `/members/${params.organisationId}/${params.userId}/owner`,
    {
      role: params.role,
    }
  );
};

export const useOwnerUpdateUserRole = () => {
  return useMutation(ownerUpdateUserRole, {
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
