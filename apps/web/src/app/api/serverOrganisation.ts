import { baseURL } from "./shared";

export const serverGetOrganisation = async (id: string) => {
  try {
    console.log(`${baseURL}/organisations/${id}`, "serverGetOrganisation");
    const response = await fetch(`${baseURL}/organisations/${id}`, {
      cache: "no-store",
    });
    return response.json();
  } catch (error) {
    console.log(error);
  }
};
