import { getUpdateQuizRequest } from "@biosfera/types";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useMutation } from "react-query";

const _getUpdateQuizRequest = getUpdateQuizRequest();

export class UpdateQuizRequest extends _getUpdateQuizRequest {}

export const updateQuiz = async (params: {
  data: UpdateQuizRequest;
  organisationId: string;
  id: string;
}) => {
  return await api.patch<UpdateQuizRequest>(
    `/${params.organisationId}/quizzes/${params.id}`,
    params.data
  );
};

export const useUpdateQuiz = () => {
  return useMutation(updateQuiz, {
    onMutate: () => {
      return { toastId: toast.loading("Izrada kviza") };
    },
    onSuccess: ({}, _variables, context) => {
      toast.success("Kviz uspješno nadograđen", { id: context?.toastId });
    },
    //Test quiz edit capabilities
    onError: (error: string, _variables, context) => {
      toast.error("Greška pri izradi kviza", { id: context?.toastId });
    },
  });
};
