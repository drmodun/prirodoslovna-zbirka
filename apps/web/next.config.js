/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: ["@biosfera/types"],
  env: {
    NEXT_PUBLIC_DOCKER: process?.env?.DOCKER,
    NEXT_PUBLIC_WEB_URL: process?.env?.WEB_URL,
  },
  images: {
    domains: [
      "localhost",
      "dummyimage.com",
      "via.placeholder.com",
      "biosfera-files.s3.eu-north-1.amazonaws.com",
    ],
  },
};

module.exports = nextConfig;
