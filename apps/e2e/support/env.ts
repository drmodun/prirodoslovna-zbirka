/**
 * Where the end-to-end stack lives. The ports are deliberately not the dev
 * ones (3000 / 5500), so a running dev stack can never be hit by accident.
 */
export const API_PORT = Number(process.env.E2E_API_PORT ?? 5610);
export const WEB_PORT = Number(process.env.E2E_WEB_PORT ?? 3110);
export const API_URL = `http://localhost:${API_PORT}`;
export const WEB_URL = `http://localhost:${WEB_PORT}`;

export const DATABASE_URL =
  process.env.E2E_DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:55434/biosfera_e2e";

export const JWT_SECRET = "e2e-secret";

/** The suite truncates tables, so it refuses any database not meant for it. */
export const assertSafeDatabase = (url = DATABASE_URL) => {
  const name = new URL(url).pathname.replace(/^\//, "");
  if (!name.endsWith("_e2e"))
    throw new Error(
      `Refusing to run end-to-end tests against "${name}": the database name must end with "_e2e".`,
    );
};
