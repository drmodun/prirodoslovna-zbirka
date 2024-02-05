import {
  CategorizationResponse,
  CreateCategorizationRequest,
} from "@biosfera/types";
import { api } from "./shared";
import { useMutation } from "react-query";

const readOrCreateCategorization = async (
  categorization: CreateCategorizationRequest
) => {
  const exists = await api.get<CategorizationResponse>(
    `/categorization/name/${categorization.species}`
  );

  if (exists) return exists.data.id;

  if (!exists) {
    const response = await api.post("/categorization", categorization);
    return response.data.id;
  }
};

export const useReadOrCreateCategorization = () => {
  return useMutation(readOrCreateCategorization, {
    onError: (error: string) => {
      throw new Error("Error creating categorization");
    },
  });
};
