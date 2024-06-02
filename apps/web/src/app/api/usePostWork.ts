import { getCreateWorkDto, WorkResponseExtended } from "@biosfera/types";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useMutation } from "react-query";

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
  return useMutation(postWork, {
    onMutate: () => {
      return { toastId: toast.loading("Izrada projekta") };
    },
    onSuccess: ({}, _variables, context) => {
      toast.success("Projekt uspješno napravljen", { id: context?.toastId });
    },
    onError: (error: string, _variables, context) => {
      toast.error("Greška pri izradi projekta", { id: context?.toastId });
    },
  });
};
