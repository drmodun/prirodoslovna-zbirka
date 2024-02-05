/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: ["@biosfera/types"],
  images: {
    domains: ["localhost", "dummyimage.com", "via.placeholder.com"],
  },
};

module.exports = nextConfig;
