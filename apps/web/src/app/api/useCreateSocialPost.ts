import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { getCreateSocialPostDto } from "@biosfera/types";
import { useTranslations } from "next-intl";

const _createSocialPostDto = getCreateSocialPostDto();
export class CreateSocialPostDto extends _createSocialPostDto {}

export const createSocialPost = async (params: {
  organisationId: string;
  data: CreateSocialPostDto;
}) => await api.post(`/social-posts/${params.organisationId}`, params.data);

export const useCreateSocialPost = () => {
  const t = useTranslations("Toasts");
  return useMutation(createSocialPost, {
    onMutate: () => {
      return { toastId: toast.loading(t("creatingSocialPost")) };
    },
    onSuccess: (_data, _variables, context) => {
      toast.success(t("socialPostCreated"), { id: context?.toastId });
      setTimeout(() => {
        window.history.back();
      }, 3000);
    },
    onError: (error: string, _variables, context) => {
      toast.error(t("socialPostCreateFailed"), { id: context?.toastId });
    },
  });
};
