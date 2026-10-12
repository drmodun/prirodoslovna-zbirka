import { filesUrl } from "@/api/getUrlServer";

export const getPfpUrl = (id: string) => {
  return `${filesUrl}/user/${id}`;
};
