"use server";

export const getBaseUrl = () => {
  return process?.env?.WEB_URL
    ? process.env.DOCKER
      ? "http://api_container:5500"
      : process.env.WEB_URL !== "http://localhost:3000"
      ? `${process?.env?.WEB_URL}/api`
      : "http://localhost:5500"
    : "http://localhost:5500";
};
