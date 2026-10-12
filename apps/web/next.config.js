const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set by the Dockerfile; `next start` does not serve a standalone build.
  ...(process.env.NEXT_OUTPUT === "standalone" && {
    output: "standalone",
    experimental: { outputFileTracingRoot: path.join(__dirname, "../../") },
  }),
  transpilePackages: [
    "@biosfera/types",
    "css-loader",
    "sass-loader",
    "style-loader",
  ],
  env: {
    NEXT_PUBLIC_WEB_URL: process?.env?.WEB_URL,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },

  crossOrigin: "anonymous",

  images: {
    remotePatterns: [
      "localhost",
      "dummyimage.com",
      "via.placeholder.com",
      "api.gbif.org",
      "biosfera-files.s3.eu-north-1.amazonaws.com",
    ].map((hostname) => ({ hostname })),
  },
};

module.exports = nextConfig;
