import {
  CategorizationResponse,
  CreateCategorizationRequest,
} from "@biosfera/types";
import { api } from "./shared";
import { useMutation } from "react-query";
import toast from "react-hot-toast";

const readOrCreateCategorization = async (
  categorization: CreateCategorizationRequest,
) => {
  try {
    const exists = await api.get<never, CategorizationResponse>(
      `/categorizations/name/${categorization.species}`,
    );

    if (exists) return exists.id;
  } catch (error) {
    const response = await api.post<
      CreateCategorizationRequest,
      CategorizationResponse
    >("/categorizations", categorization);
    return response.id;
  }
};

export const useReadOrCreateCategorization = () => {
  return useMutation(readOrCreateCategorization, {
    onError: (error: string) => {
      toast.error(error);
    },
  });
};
