const path = require("path");
const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

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
// Accepts a bare host ("files.example.com") as well as a full address, and
// returns undefined for anything that still is not a URL, so a mistyped
// setting falls back instead of failing the build.
const toUrl = (value) => {
  // No value, or a scheme other than http(s) such as s3://.
  if (!value || /^(?!https?:)[a-z0-9+.-]+:\/\//i.test(value)) return undefined;
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    new URL(withScheme);
    return withScheme.replace(/\/+$/, "");
  } catch {
    console.warn(`Ignoring "${value}": not a valid address for uploaded files`);
    return undefined;
  }
};

const filesUrl =
  toUrl(process.env.NEXT_PUBLIC_FILES_URL) ||
  (useLocalFiles
    ? `${LOCAL_API_URL}/blobs/file`
    : toUrl(process.env.AWS_S3_URL) || s3FilesUrl());
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

module.exports = withNextIntl(nextConfig);
