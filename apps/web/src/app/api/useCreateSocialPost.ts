import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { getCreateSocialPostDto } from "@biosfera/types";

const _createSocialPostDto = getCreateSocialPostDto();
export class CreateSocialPostDto extends _createSocialPostDto {}

export const createSocialPost = async (params: {
  organisationId: string;
  data: CreateSocialPostDto;
}) => await api.post(`/social-posts/${params.organisationId}`, params.data);

export const useCreateSocialPost = () => {
  return useMutation(createSocialPost, {
    onMutate: () => {
      return { toastId: toast.loading("Kreiranje objave") };
    },
    onSuccess: ({}, _variables, context) => {
      toast.success("Objava uspješno kreirana", { id: context?.toastId });
      setTimeout(() => {
        window.history.back();
      }, 3000);
    },
    onError: (error: string, _variables, context) => {
      toast.error("Greška pri kreiranju objave", { id: context?.toastId });
    },
  });
};
