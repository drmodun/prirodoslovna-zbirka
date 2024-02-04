import { api } from "./shared";

export const checkForCategorization = (id: string) =>
  api.get(`/categorization/${id}`);
