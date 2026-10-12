import { apiUrl } from "./getUrlServer";

export const serverGetPost = async (id: string) => {
  try {
    const response = await fetch(apiUrl(["posts", id]), {
      cache: "no-store",
    });
    if (response.status === 404) return null;
    return response.json();
  } catch (error) {
    console.log(error);
  }
};
