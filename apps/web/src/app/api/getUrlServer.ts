"use server";

export const getBaseUrl = () => {
  return process?.env?.WEB_URL
    ? process.env.DOCKER
      ? "http://api_container:5500"
      : `${process.env.WEB_URL}/api`
    : "http://localhost:5500";
};
