import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { getCreateSocialPostDto } from "@biosfera/types";

const _updateSocialPostDto = getCreateSocialPostDto();
export class CreateSocialPostDto extends _updateSocialPostDto {}

export const updateSocialPost = async (params: {
  socialPost: CreateSocialPostDto;
  organisationId: string;
}) =>
  await api.post(`/social-posts/${params.organisationId}`, params.socialPost);

export const useCreateSocialPost = () => {
  return useMutation(updateSocialPost, {
    onMutate: () => {
      return { toastId: toast.loading("Kreiranje objave") };
    },
    onSuccess: ({}, _variables, context) => {
      toast.success("Objava uspješno kreirana", { id: context?.toastId });
    },
    onError: (error: string, _variables, context) => {
      toast.error("Greška pri kreiranju objave", { id: context?.toastId });
    },
  });
};
