import { getBaseUrl } from "./getUrlServer";

export const getWork = async (id: string) => {
  try {
    const response = await fetch(`${getBaseUrl()}/works/${id}`, {
      cache: "no-store",
    });

    if (response.status === 404) {
      return null;
    }

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
  }
};
