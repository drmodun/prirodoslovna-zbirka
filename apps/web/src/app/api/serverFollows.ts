import { getBaseUrl } from "./getUrlServer";

const baseURL =
  process.env.DOCKER === "true"
    ? "http://api_container:5500"
    : "http://localhost:5500";

export const getUserFollowers = async (id: string) => {
  try {
    const response = await fetch(`${getBaseUrl()}/follows/${id}/followers`, {
      cache: "no-store",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getUserFollowing = async (id: string) => {
  try {
    const response = await fetch(`${getBaseUrl()}/follows/${id}/following`, {
      cache: "no-store",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};
