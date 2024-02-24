import { baseURL } from "./shared";

export const getUserFollowers = async (id: string) => {
  try {
    const response = await fetch(`${baseURL}/follows/${id}/followers`, {
      cache: "no-cache",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getUserFollowing = async (id: string) => {
  try {
    const response = await fetch(`${baseURL}/follows/${id}/following`, {
      cache: "no-cache",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};
