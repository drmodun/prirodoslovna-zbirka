"use client";

import dynamic from "next/dynamic";

// pdf.js needs browser APIs (DOMMatrix) as soon as it loads, so the reader is
// only rendered in the browser.
const DocumentReader = dynamic(
  () => import("./DocumentReader").then((module) => module.DocumentReader),
  { ssr: false },
);

export default DocumentReader;
