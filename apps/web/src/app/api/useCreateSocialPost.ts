import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { getCreateSocialPostDto } from "@biosfera/types";

const _createSocialPostDto = getCreateSocialPostDto();
export class CreateSocialPostDto extends _createSocialPostDto {}

export const createSocialPost = async (socialPost: CreateSocialPostDto) =>
  await api.post(`/social-posts`, socialPost);

export const useCreateSocialPost = () => {
  return useMutation(createSocialPost, {
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
