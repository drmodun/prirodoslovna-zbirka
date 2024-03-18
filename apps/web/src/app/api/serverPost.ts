const baseURL = process.env.DOCKER === "true" ? "http://api_container:5500" : "http://localhost:5500";

export const serverGetPost = async (id: string) => {
  try {
    const response = await fetch(`${baseURL}/posts/${id}`, {
      cache: "no-store",
    });
    if (response.status === 404) return null;
    return response.json();
  } catch (error) {
    console.log(error);
  }
};
