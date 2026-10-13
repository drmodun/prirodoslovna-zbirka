import { assertSafeDatabase } from "./env";

/** Nothing to prepare: the API server applies the migrations on start-up. */
export default async function globalSetup() {
  assertSafeDatabase();
}
