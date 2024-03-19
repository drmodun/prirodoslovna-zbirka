import { getBaseUrl } from "./getUrlServer";

export const serverGetExponat = async (id: string) => {
  try {
    const response = await fetch(`${getBaseUrl()}/exponats/${id}`, {
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
