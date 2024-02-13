import { baseURL } from "./shared";

export const serverGetPost = async (id: string) => {
  try {
    const response = await fetch(`${baseURL}/posts/${id}`, {
      next: { revalidate: 3600 * 24 * 7, tags: ["posts"] },
    });

    return response.json();
  } catch (error) {
    console.log(error);
  }
};
