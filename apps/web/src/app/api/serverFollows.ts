import { apiFetch } from "./getUrlServer";

export const getUserFollowers = async (id: string) => {
  try {
    const response = await apiFetch(["follows", id, "followers"], {
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
    const response = await apiFetch(["follows", id, "following"], {
      cache: "no-store",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};
