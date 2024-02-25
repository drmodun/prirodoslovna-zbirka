import { baseURL } from "./shared";

export const serverGetExponat = async (id: string) => {
  try {
    const response = await fetch(`${baseURL}/exponats/${id}`, {
      cache: "no-store",
    });

    return response.json();
  } catch (error) {
    console.log(error);
  }
};
