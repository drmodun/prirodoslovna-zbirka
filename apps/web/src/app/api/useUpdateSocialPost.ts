import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { getUpdateSocialPostDto } from "@biosfera/types";
import { useTranslations } from "next-intl";

const _updateSocialPostDto = getUpdateSocialPostDto();
export class UpdateSocialPostDto extends _updateSocialPostDto {}

export const updateSocialPost = async (params: {
  socialPost: UpdateSocialPostDto;
  organisationId: string;
  id: string;
}) =>
  await api.patch(
    `/social-posts/${params.organisationId}/${params.id}`,
    params.socialPost,
  );

export const useUpdateSocialPost = () => {
  const t = useTranslations("Toasts");
  return useMutation(updateSocialPost, {
    onMutate: () => {
      return { toastId: toast.loading(t("updatingSocialPost")) };
    },
    onSuccess: (_data, _variables, context) => {
      toast.success(t("socialPostUpdated"), { id: context?.toastId });
    },
    onError: (error: string, _variables, context) => {
      toast.error(t("socialPostUpdateFailed"), { id: context?.toastId });
    },
  });
};
