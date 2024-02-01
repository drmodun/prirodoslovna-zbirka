import { baseURL } from "./shared";

export const serverGetOrganisation = async (id: string) => {
  try {
    const response = await fetch(`${baseURL}/organisations/${id}`, {
      next: { revalidate: 3600 * 24, tags: ["organisations"] },
    });
    return response.json();
  } catch (error) {
    console.log(error);   
  }
};
