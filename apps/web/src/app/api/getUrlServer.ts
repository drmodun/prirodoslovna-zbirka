"use server";

export const getBaseUrl = () =>
  process?.env?.WEB_URL && process.env.DOCKER
    ? "http://api_container:5500"
    : "http://localhost:5500";
