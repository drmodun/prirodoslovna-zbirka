"use server";

export const getBaseUrl = () =>
  process?.env?.WEB_URL && process?.env?.WEB_URL !== "http://localhost:3000"
    ? "http://api_container:5500"
    : "http://localhost:5500";
