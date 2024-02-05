import { getCreateExponatDto } from "@biosfera/types";
import { api } from "./shared";
import { useMutation } from "react-query";
import toast from "react-hot-toast";

const _createExponatDto = getCreateExponatDto();

export class CreateExponatDto extends _createExponatDto {}

const createExponat = (exponat: CreateExponatDto) => {
  return api.post("/exponat", exponat);
};

export const useCreateExponat = () => {
  return useMutation(createExponat, {
    onError: (error: string) => {
      toast.error(error, { id: "create-exponat" });
    },
  });
};
