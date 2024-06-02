import { useQuery } from "react-query";
import { api } from "./shared";
import { WorkResponseExtended } from "@biosfera/types";

export const getClientWork = async (workId: string) =>
  await api.get<never, WorkResponseExtended>(`/works/${workId}`);

export const useGetClientWork = (workId: string) => {
  return useQuery(["work", workId], () => getClientWork(workId));
};
