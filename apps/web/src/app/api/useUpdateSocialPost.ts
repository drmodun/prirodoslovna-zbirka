import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { getUpdateSocialPostDto } from "@biosfera/types";

const _updateSocialPostDto = getUpdateSocialPostDto();
export class UpdateSocialPostDto extends _updateSocialPostDto {}

export const updateSocialPost = async (params: {
  socialPost: UpdateSocialPostDto;
  organisationId: string;
  id: string;
}) =>
  await api.patch(`/social-posts/${params.organisationId}/${params.id}`, params.socialPost);

export const useUpdateSocialPost = () => {
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
