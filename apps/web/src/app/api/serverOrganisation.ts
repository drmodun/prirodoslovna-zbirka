import { baseURL } from "./shared";

export const serverGetOrganisation = async (id: string) => {
  try {
    const response = await fetch(`${baseURL}/organisations/${id}`, {
      cache: "no-cache",
    });
    return response.json();
  } catch (error) {
    console.log(error);
  }
};
