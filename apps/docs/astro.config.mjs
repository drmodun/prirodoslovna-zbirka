// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// The docs are served under /docs on the same origin as the app (see
// packages/config/Caddyfile), so every link is generated with that prefix.
// PUBLIC_URL is the address people open, as in docker-compose.yml.
export default defineConfig({
  site: process.env.PUBLIC_URL || "http://localhost",
  base: "/docs",
  trailingSlash: "ignore",
  integrations: [
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
