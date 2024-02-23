import { getUpdateExponatDto } from "@biosfera/types";
import { api } from "./shared";
import { useMutation } from "react-query";
import toast from "react-hot-toast";

export const _updateExponatDto = getUpdateExponatDto();
export class UpdateExponatDto extends _updateExponatDto {}

export const updateExponat = async (params: {
  exponatId: string;
  updateExponatDto: UpdateExponatDto;
}) => {
  await api.patch(`/exponats/${params.exponatId}`, params.updateExponatDto);
};

export const useUpdateExponat = () => {
  return useMutation(updateExponat, {
    onError: (error: string) => {
      console.log(error);
      toast.error("Greška se dogodila tijekom mijenjanja podataka eksponata", {
        id: "update-exponat",
      });
    },
    onSuccess: () => {
      toast.success("Promijenjeni podaci organizacije", {
        id: "update-exponat",
      });
    },
  });
};
