import { getCreateQuizRequest, QuizResponseExtended } from "@biosfera/types";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useMutation } from "react-query";

const _getCreateQuizRequest = getCreateQuizRequest();

export class CreateQuizRequest extends _getCreateQuizRequest {}

export const createQuiz = async (params: {
  data: CreateQuizRequest;
  organisationId: string;
}) => {
  return await api.post<CreateQuizRequest>(
    `/${params.organisationId}/quizzes`,
    params.data,
  );
};

export const useCreateQuiz = () => {
  return useMutation(createQuiz, {
    onMutate: () => {
      return { toastId: toast.loading("Izrada kviza") };
    },
    onSuccess: ({}, _variables, context) => {
      toast.success("Kviz uspješno napravljen", { id: context?.toastId });
    },
    onError: (error: string, _variables, context) => {
      toast.error("Greška pri izradi kviza", { id: context?.toastId });
    },
  });
};
