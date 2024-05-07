import { getBaseUrl } from "./getUrlServer";

export const getWork = async (id: string) => {
  try {
    const response = await fetch(`${getBaseUrl()}/works/${id}`, {
      cache: "no-store",
    });

    if (response.status === 404) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.log(error);
  }
};
