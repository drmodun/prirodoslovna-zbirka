import { getCreateQuizRequest, QuizResponseExtended } from "@biosfera/types";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useMutation } from "react-query";
import { useTranslations } from "next-intl";

const _getCreateQuizRequest = getCreateQuizRequest();

export class CreateQuizRequest extends _getCreateQuizRequest {}

export const createQuiz = async (params: {
  data: CreateQuizRequest;
  organisationId: string;
}) => {
  return await api.post<CreateQuizRequest>(
    `/quizzes/${params.organisationId}`,
    params.data,
  );
};

export const useCreateQuiz = () => {
  const t = useTranslations("Toasts");
  return useMutation(createQuiz, {
    onMutate: () => {
      return { toastId: toast.loading(t("creatingQuiz")) };
    },
    onSuccess: (_data, _variables, context) => {
      toast.success(t("quizCreated"), { id: context?.toastId });
    },
    onError: (error: string, _variables, context) => {
      toast.error(t("quizCreateFailed"), { id: context?.toastId });
    },
  });
};
