import { getUpdateWorkDto, WorkResponseExtended } from "@biosfera/types";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useMutation } from "react-query";

const updateWorkRequest = getUpdateWorkDto();

export class UpdateWorkRequest extends updateWorkRequest {}

const updateWork = async (data: { id: string; object: UpdateWorkRequest }) =>
  await api.patch(`/works/${data.id}`, data.object);

export const useUpdateWork = () => {
  return useMutation(updateWork, {
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
