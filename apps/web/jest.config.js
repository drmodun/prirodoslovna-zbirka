const nextJest = require("next/jest");

// next/jest wires up the SWC transform and stubs CSS/SCSS modules and images
// exactly like the Next build does.
const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // tsconfig has baseUrl ./src, so "components/..." style imports must resolve.
  moduleDirectories: ["node_modules", "<rootDir>/src"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/app/$1",
    // Only throws outside React server components, which Jest is not.
    "^server-only$": "<rootDir>/src/test-utils/empty.ts",
  },
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.test.{ts,tsx}",
    "!src/test-utils/**",
    "!src/**/layout.tsx",
    "!src/**/*.d.ts",
  ],
};

// ESM-only packages that must still go through the transform.
const ESM_PACKAGES = [
  "query-string",
  "decode-uri-component",
  "split-on-first",
  "filter-obj",
  "next-intl",
  "use-intl",
  "icu-minify",
  "@formatjs",
  "intl-messageformat",
];

module.exports = async () => {
  const resolved = await createJestConfig(config)();
  // next/jest resets transformIgnorePatterns, so it is patched afterwards.
  resolved.transformIgnorePatterns = [
    `/node_modules/(?!(${ESM_PACKAGES.join("|")})/)`,
    "^.+\\.module\\.(css|sass|scss)$",
  ];
  return resolved;
};
