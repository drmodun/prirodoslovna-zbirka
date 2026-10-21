import { getUpdateWorkDto, WorkResponseExtended } from "@biosfera/types";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useMutation } from "react-query";
import { useTranslations } from "next-intl";

const updateWorkRequest = getUpdateWorkDto();

export class UpdateWorkRequest extends updateWorkRequest {}

const updateWork = async (data: { id: string; object: UpdateWorkRequest }) =>
  await api.patch(`/works/${data.id}`, data.object);

export const useUpdateWork = () => {
  const t = useTranslations("Toasts");
  return useMutation(updateWork, {
    onMutate: () => {
      return { toastId: toast.loading(t("updatingWork")) };
    },
    onSuccess: (_data, _variables, context) => {
      toast.success(t("workUpdated"), { id: context?.toastId });
    },
    onError: (error: string, _variables, context) => {
      toast.error(t("workUpdateFailed"), { id: context?.toastId });
    },
  });
};
