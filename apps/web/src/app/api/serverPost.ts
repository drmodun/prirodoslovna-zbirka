import { baseURL } from "./shared";

export const serverGetPost = async (id: string) => {
  try {
    const response = await fetch(`${baseURL}/posts/${id}`, {
      cache: "no-store",
    });

    return response.json();
  } catch (error) {
    console.log(error);
  }
};
