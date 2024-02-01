import { baseURL } from "./shared";

export const serverGetExponat = async (id: string) => {
  try {
    const response = await fetch(`${baseURL}/exponats/${id}`, {
      next: { revalidate: 3600 * 12, tags: ["exponats"] },
    });

    return response.json();
  } catch (error) {
    console.log(error);
  }
};
