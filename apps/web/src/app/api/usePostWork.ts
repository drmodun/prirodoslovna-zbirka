import { getCreateWorkDto, WorkResponseExtended } from "@biosfera/types";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useMutation } from "react-query";
import { useTranslations } from "next-intl";

const createWorkRequest = getCreateWorkDto();

export class CreateWorkRequest extends createWorkRequest {}

const postWork = async (data: {
  body: CreateWorkRequest;
  organisationId: string;
}) =>
  await api.post<never, WorkResponseExtended>(
    `/works/${data.organisationId}`,
    data.body,
  );

export const usePostWork = () => {
  const t = useTranslations("Toasts");
  return useMutation(postWork, {
    onMutate: () => {
      return { toastId: toast.loading(t("creatingWork")) };
    },
    onSuccess: (_data, _variables, context) => {
      toast.success(t("workCreated"), { id: context?.toastId });
    },
    onError: (error: string, _variables, context) => {
      toast.error(t("workCreateFailed"), { id: context?.toastId });
    },
  });
};
