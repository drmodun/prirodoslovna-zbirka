const baseURL = process.env.DOCKER === "true" ? "http://api_container:5500" : "http://localhost:5500";

export const serverGetUser = async (id: string) => {
  try {
    const response = await fetch(`${baseURL}/users/${id}`, {
      cache: "no-store",
    }); //user data cannot be cached since it is proably the most dynamic one, possibly do this with manual revalidation later

    if (response.status === 404) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.log(error);
  }
};
