/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: ["@biosfera/types"],
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
