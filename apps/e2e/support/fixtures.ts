import { test as base, expect, type Page } from "@playwright/test";
import { API_URL } from "./env";
import { PASSWORD, prisma, resetDatabase } from "./db";

type User = { id: string; email: string };

/** Logs a user in the way the app does: the JWT sits in localStorage. */
export const loginAs = async (page: Page, user: User) => {
  const response = await page.request.post(`${API_URL}/auth/login`, {
    data: { email: user.email, password: PASSWORD },
  });
  expect(response.ok(), "login through the API").toBeTruthy();
  const { access_token } = await response.json();
  // Seeds the session once per tab (sessionStorage survives navigations), so
  // that signing out in the app really signs the test out.
  await page.addInitScript((token) => {
    if (sessionStorage.getItem("e2e-session-seeded")) return;
    sessionStorage.setItem("e2e-session-seeded", "1");
    localStorage.setItem("access_token", token);
    localStorage.setItem("loggedTime", new Date().toISOString());
  }, access_token);
  return access_token as string;
};

export const test = base.extend<{ cleanDatabase: void }>({
  // Every test starts from (and leaves behind) an empty database.
  cleanDatabase: [
    async ({}, use) => {
      await resetDatabase();
      await use();
    },
    { auto: true },
  ],
});

export { expect, prisma, PASSWORD };
