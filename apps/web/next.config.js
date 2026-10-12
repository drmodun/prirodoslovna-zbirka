const path = require("path");

// Default public address of a bucket; mirrors BlobService in the API.
const s3FilesUrl = () => {
  const bucket = process.env.AWS_S3_BUCKET || "biosfera-files";
  const endpoint = process.env.AWS_ENDPOINT_URL_S3?.replace(/\/+$/, "");
  const region = process.env.AWS_REGION || "eu-north-1";
  return endpoint
    ? `${endpoint}/${bucket}`
    : `https://${bucket}.s3.${region}.amazonaws.com`;
};
const LOCAL_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500";

// Where uploaded files are read from. NEXT_PUBLIC_FILES_URL overrides. Without
// S3 settings, `next dev` and builds with FILES_FALLBACK=local (the compose
// build) read the files the API keeps on disk; anything else reads the bucket.
const hasS3 = !!(process.env.AWS_S3_URL || process.env.AWS_S3_BUCKET);
const useLocalFiles =
  !hasS3 &&
  (process.env.NODE_ENV === "development" ||
    process.env.FILES_FALLBACK === "local");
const filesUrl = (
  process.env.NEXT_PUBLIC_FILES_URL ||
  (useLocalFiles
    ? `${LOCAL_API_URL}/blobs/file`
    : process.env.AWS_S3_URL || s3FilesUrl())
).replace(/\/+$/, "");
// The image optimizer fetches from the web server, which cannot be assumed to
// reach a plain-http (local or in-network) address the browser uses.
const filesAreLocal = !filesUrl.startsWith("https://");

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
    NEXT_PUBLIC_FILES_URL: filesUrl,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },

  crossOrigin: "anonymous",

  images: {
    // The optimizer fetches from the web server, which cannot reach a
    // browser-facing localhost address when it runs in a container.
    unoptimized: filesAreLocal,
    remotePatterns: [
      "localhost",
      "dummyimage.com",
      "via.placeholder.com",
      "api.gbif.org",
      "biosfera-files.s3.eu-north-1.amazonaws.com",
      new URL(filesUrl).hostname,
    ].map((hostname) => ({ hostname })),
  },
};

module.exports = nextConfig;
