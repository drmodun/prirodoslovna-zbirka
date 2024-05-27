import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";

const transferOwnership = async (params: {
  organisationId: string;
  userId: string;
  role: string;
}) => {
  return await api.put(
    `/members/${params.organisationId}/${params.userId}/transfer`,
  );
};

export const useTransferOwnership = () => {
  return useMutation(transferOwnership, {
    onSuccess: () => {
      toast.success("Uspješno predano vlasništvo nad organizacijom", {
        id: "update-user-role",
        icon: "👏",
      });
    },
    onError: (error) => {
      toast.error("Greška sa prenošenjem vlasništva", {
        id: "update-user-role",
        icon: "👏",
      });
    },
  });
};
