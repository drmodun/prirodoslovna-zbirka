import { createUser, prisma } from "../support/db";
import { WEB_URL } from "../support/env";
import { expect, loginAs, test } from "../support/fixtures";

// The cookie a second browser starts with.
const croatian = {
  cookies: [
    {
      name: "NEXT_LOCALE",
      value: "hr",
      domain: new URL(WEB_URL).hostname,
      path: "/",
      expires: -1,
      httpOnly: false,
      secure: false,
      sameSite: "Lax" as const,
    },
  ],
  origins: [],
};

test.describe("interface language", () => {
  test("a visitor switches the landing page between Croatian and English", async ({
    page,
    context,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Vaša digitalna zbirka." }),
    ).toBeVisible();

    await page.getByRole("main").getByRole("button", { name: "EN" }).click();
    await expect(
      page.getByRole("heading", { name: "Your digital collection." }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    // the choice is a cookie, so it survives a reload
    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === "NEXT_LOCALE")?.value).toBe("en");
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Your digital collection." }),
    ).toBeVisible();

    await page.getByRole("main").getByRole("button", { name: "HR" }).click();
    await expect(
      page.getByRole("heading", { name: "Vaša digitalna zbirka." }),
    ).toBeVisible();
  });

  test("without a cookie the app is in English", async ({ browser }) => {
    // newContext() inherits the config's Croatian cookie unless told otherwise
    const context = await browser.newContext({
      baseURL: WEB_URL,
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Your digital collection." }),
    ).toBeVisible();
    await context.close();
  });

  test("a logged in user's choice is saved to the profile and follows them to other browsers", async ({
    page,
    browser,
  }) => {
    const user = await createUser({ language: "HR" });
    await loginAs(page, user);
    await page.goto("/discover");

    await page
      .getByRole("button", { name: "Otvori ili zatvori izbornik" })
      .click();
    await page
      .getByRole("group", { name: "Jezik" })
      .getByRole("button", { name: "EN" })
      .click();
    await expect(page.getByRole("button", { name: "Exhibits" })).toBeVisible();
    await expect
      .poll(
        async () =>
          (await prisma.user.findUniqueOrThrow({ where: { id: user.id } }))
            .language,
      )
      .toBe("EN");

    // another browser still set to Croatian switches once the user logs in
    const other = await browser.newContext({
      baseURL: WEB_URL,
      storageState: croatian,
    });
    const otherPage = await other.newPage();
    await loginAs(otherPage, user);
    await otherPage.goto("/discover");
    await expect(
      otherPage.getByRole("button", { name: "Exhibits" }),
    ).toBeVisible();
    await other.close();
  });
});
