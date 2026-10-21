import { getUpdateQuizRequest } from "@biosfera/types";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useMutation } from "react-query";
import { useTranslations } from "next-intl";

const _getUpdateQuizRequest = getUpdateQuizRequest();

export class UpdateQuizRequest extends _getUpdateQuizRequest {}

export const updateQuiz = async (params: {
  data: UpdateQuizRequest;
  organisationId: string;
  id: string;
}) => {
  return await api.patch<UpdateQuizRequest>(
    `/quizzes/${params.organisationId}/${params.id}`,
    params.data,
  );
};

export const useUpdateQuiz = () => {
  const t = useTranslations("Toasts");
  return useMutation(updateQuiz, {
    onMutate: () => {
      return { toastId: toast.loading(t("updatingQuiz")) };
    },
    onSuccess: (_data, _variables, context) => {
      toast.success(t("quizUpdated"), { id: context?.toastId });
    },
    //Test quiz edit capabilities
    onError: (error: string, _variables, context) => {
      toast.error(t("quizUpdateFailed"), { id: context?.toastId });
    },
  });
};
