/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: ["@biosfera/types"],
  env: {
    NEXT_PUBLIC_DOCKER: process?.env?.DOCKER,
    NEXT_PUBLIC_WEB_URL: process?.env?.WEB_URL,
  },
  experimental: {
    serverActions: true,
  },

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },

  crossOrigin: "anonymous",

  images: {
    domains: [
      "localhost",
      "dummyimage.com",
      "via.placeholder.com",
      "api.gbif.org",
      "biosfera-files.s3.eu-north-1.amazonaws.com",
    ],
  },
};

module.exports = nextConfig;
