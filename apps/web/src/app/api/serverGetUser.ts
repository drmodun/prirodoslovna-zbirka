import { ExtendedUserResponse } from "@biosfera/types";
import { baseURL } from "./shared";

export const getUser = async (id: string) => {
  try {
    const response = await fetch(`${baseURL}/users/${id}`, {
      cache: "no-store",
    }); //user data cannot be cached since it is proably the most dynamic one, possibly do this with manual revalidation later

    return response.json();
  } catch (error) {
    console.log(error);
  }
};
