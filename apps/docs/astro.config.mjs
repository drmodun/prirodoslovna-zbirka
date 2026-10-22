// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { docsBaseLinks } from "./docs-base-links.mjs";

// Where the docs are mounted depends on where they run:
//   - behind the stack's proxy (local, docker dev, docker prod): /docs
//   - Vercel / Netlify: the site root, detected from the platform's own build
//     variables, so nothing has to be configured there ("set and forget")
// DOCS_BASE overrides either way. Use "/" for the root: an empty value is
// dropped by some dashboards, which would silently fall back to /docs and
// request every stylesheet and image from a path that does not exist.
const hostedAtRoot = Boolean(process.env.VERCEL || process.env.NETLIFY);
const normalizeBase = (value) => {
  const trimmed = value.trim().replace(/^\/+|\/+$/g, "");
  return trimmed ? `/${trimmed}` : "/";
};
const base = normalizeBase(
  process.env.DOCS_BASE || (hostedAtRoot ? "/" : "/docs"),
);

// Absolute links (sitemap, canonical) need the public address. PUBLIC_URL wins;
// otherwise the host's own deployment URL, then localhost.
const vercelHost =
  process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const site =
  process.env.PUBLIC_URL ||
  process.env.URL ||
  (vercelHost && `https://${vercelHost}`) ||
  "http://localhost";

export default defineConfig({
  site,
  base,
  trailingSlash: "ignore",
  integrations: [
    docsBaseLinks({ base }),
    starlight({
      title: "Biosfera",
      description:
        "Developer and operator documentation for Biosfera, the natural history collection platform.",
      logo: { src: "./public/favicon.svg", alt: "" },
      favicon: "/favicon.svg",
      customCss: ["./src/styles/theme.css"],
      lastUpdated: false,
      sidebar: [
        { label: "Getting started", items: [{ autogenerate: { directory: "getting-started" } }] },
        { label: "Architecture", items: [{ autogenerate: { directory: "architecture" } }] },
        { label: "Features", items: [{ autogenerate: { directory: "features" } }] },
        { label: "Reference", items: [{ autogenerate: { directory: "reference" } }] },
        { label: "Contributing", items: [{ autogenerate: { directory: "contributing" } }] },
      ],
    }),
  ],
});
