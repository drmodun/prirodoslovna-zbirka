const baseURL = process.env.DOCKER === "true" ? "http://api_container:5500" : "http://localhost:5500";

export const serverGetExponat = async (id: string) => {
  try {
    const response = await fetch(`${baseURL}/exponats/${id}`, {
      cache: "no-store",
    });

    if (response.status === 404) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.log(error);
  }
};
