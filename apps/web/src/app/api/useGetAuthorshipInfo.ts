import { useQuery } from "react-query";
import { api } from "./shared";

export const getAuthorshipInfo = async (authorId?: string) => {
  if (!authorId) throw new Error("Author id is required");
  return await api.get(`/authorship-info/${authorId}`);
};

export const useGetAuthorshipInfo = (authorId?: string) => {
  return useQuery(["authorship-info", authorId], () =>
    getAuthorshipInfo(authorId),
  );
};
