import { CreateCategorizationRequest } from "@biosfera/types";
import { api } from "./shared";
import { useMutation } from "react-query";

const createCategorization = (categorization: CreateCategorizationRequest) =>
  api.post("/categorization", categorization);

export const useCreateCategorization = () => {
  return useMutation(createCategorization, {
    onError: (error: string) => {
      throw new Error("Error creating categorization");
    },
  });
};  
