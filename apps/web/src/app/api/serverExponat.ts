import { Console } from "console";
import { apiFetch } from "./getUrlServer";

export const serverGetExponat = async (id: string) => {
  try {
    const response = await apiFetch(["exponats", id], {
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
