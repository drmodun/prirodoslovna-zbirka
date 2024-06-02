/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  transpilePackages: [
    "@biosfera/types",
    "css-loader",
    "sass-loader",
    "style-loader",
  ],
  env: {
    NEXT_PUBLIC_DOCKER: process?.env?.DOCKER,
    NEXT_PUBLIC_WEB_URL: process?.env?.WEB_URL,
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        `${process.env.WEB_URL}:3000`,
        `${process.env.WEB_URL.split("https://")[1]}:3000`,
        `${process.env.WEB_URL.split("http://")[1]}:3000`,
      ],
    },
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

module.exports = withBundleAnalyzer(nextConfig);
