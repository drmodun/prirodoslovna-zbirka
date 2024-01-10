/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: ["@biosfera/types"],
  images: {
    domains: ["localhost", "dummyimage.com"],
  },
};

module.exports = nextConfig;
