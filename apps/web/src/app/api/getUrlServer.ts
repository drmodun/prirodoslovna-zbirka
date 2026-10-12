const LOCAL_API = "http://localhost:5500";

// Deployments that only set WEB_URL serve the API behind the same host at /api.
const fromWebUrl = (webUrl?: string) =>
  webUrl && webUrl !== "http://localhost:3000" ? `${webUrl}/api` : LOCAL_API;

// Address the browser uses. Inlined at build time.
export const publicApiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  fromWebUrl(process.env.NEXT_PUBLIC_WEB_URL);

// Address of an API endpoint. The host always comes from configuration, and
// every path part is encoded, so a value taken from a request (an id from the
// route, say) stays a single segment: "../users" or "//evil.example" cannot
// steer the request to another endpoint or host.
const apiUrl = (segments: (string | number)[], query?: string) =>
  `${getBaseUrl()}/${segments
    .map((segment) => encodeURIComponent(String(segment)))
    .join("/")}${query ? `?${query}` : ""}`;

// The one place server code calls the API from. Callers pass path parts and
// an encoded query string, never an address, so the request can only go to
// the configured API host.
export const apiFetch = (
  segments: (string | number)[],
  { query, ...init }: RequestInit & { query?: string } = {},
) => fetch(apiUrl(segments, query), init);

// Base address of uploaded files: the S3 bucket, or the API's own storage
// when S3 is not configured. Resolved in next.config.js, inlined at build time.
export const filesUrl =
  process.env.NEXT_PUBLIC_FILES_URL ||
  "https://biosfera-files.s3.eu-north-1.amazonaws.com";

// Server-side fetches can reach the API on a private address (e.g. the
// compose service name); API_INTERNAL_URL is read at runtime.
export const getBaseUrl = () =>
  typeof window === "undefined"
    ? process.env.API_INTERNAL_URL || publicApiUrl
    : publicApiUrl;
