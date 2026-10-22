import type { APIRequestContext, Locator, Page } from "@playwright/test";
import { createPasswordResetToken, createUser } from "../support/db";
import { API_URL, WEB_URL } from "../support/env";
import { expect, loginAs, prisma, test } from "../support/fixtures";

const DAY = 24 * 60 * 60 * 1000;
const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

// The API tokens section sits on the owner's profile, in the Edit tab that
// opens by default.
const openTokens = async (page: Page, user: { id: string; email: string }) => {
  const jwt = await loginAs(page, user);
  await page.goto(`/user/${user.id}`);
  const section = page.getByRole("region", { name: "API tokeni" });
  await expect(section).toBeVisible();
  return { jwt, section };
};

const modal = (page: Page) => page.locator("#portal");

type TokenForm = {
  name: string;
  access?: "Samo čitanje (GET zahtjevi)" | "Čitanje i pisanje";
  expiry?: "7" | "30" | "90" | "365" | "custom" | "never";
  days?: string;
};

const fillTokenForm = async (page: Page, section: Locator, form: TokenForm) => {
  await section.getByRole("button", { name: "Novi token" }).click();
  const dialog = modal(page);
  await expect(
    dialog.getByRole("heading", { name: "Novi API token" }),
  ).toBeVisible();
  await dialog.getByPlaceholder("npr. MCP na mom laptopu").fill(form.name);
  if (form.access) await dialog.getByLabel(form.access).check();
  if (form.expiry) await dialog.getByRole("combobox").selectOption(form.expiry);
  if (form.days) await dialog.getByRole("spinbutton").fill(form.days);
};

// Creates a token through the dialog and returns the value it shows once.
const createTokenInUi = async (
  page: Page,
  section: Locator,
  form: TokenForm,
) => {
  await fillTokenForm(page, section, form);
  const dialog = modal(page);
  await dialog.getByRole("button", { name: "Napravi token" }).click();
  const value = dialog.getByTestId("new-api-token");
  await expect(value).toHaveText(/^bsf_[A-Za-z0-9_-]{43}$/);
  const token = (await value.textContent())!;
  await dialog.getByRole("button", { name: "Gotovo" }).click();
  await expect(value).toBeHidden();
  return token;
};

// For tokens a test only needs to exist: made over the API with the login.
const createTokenViaApi = async (
  request: APIRequestContext,
  jwt: string,
  body: Record<string, unknown> = {},
) => {
  const response = await request.post(`${API_URL}/auth/tokens`, {
    headers: bearer(jwt),
    data: { name: "Skripta", scopes: ["READ"], ...body },
  });
  expect(response.status()).toBe(201);
  return (await response.json()) as {
    id: string;
    token: string;
    prefix: string;
  };
};

const row = (section: Locator, name: string) =>
  section.getByRole("listitem").filter({ hasText: name });

const me = (request: APIRequestContext, token: string) =>
  request.get(`${API_URL}/auth/me`, { headers: bearer(token) });

test.describe("creating and using API tokens", () => {
  test("a user creates a token, sees it once and uses it to read as themself", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const user = await createUser();
    const { section } = await openTokens(page, user);
    await expect(section.getByText("Još nemate API tokena.")).toBeVisible();

    await fillTokenForm(page, section, { name: "MCP na laptopu" });
    const dialog = modal(page);
    // read only and 90 days unless the user picks otherwise
    await expect(
      dialog.getByLabel("Samo čitanje (GET zahtjevi)"),
    ).toBeChecked();
    await expect(dialog.getByRole("combobox")).toHaveValue("90");
    await dialog.getByRole("button", { name: "Napravi token" }).click();

    const value = dialog.getByTestId("new-api-token");
    await expect(value).toHaveText(/^bsf_/);
    const token = (await value.textContent())!;
    await expect(dialog.getByRole("alert")).toContainText(
      "Više se neće prikazati",
    );
    await dialog.getByRole("button", { name: "Kopiraj" }).click();
    await expect(
      dialog.getByRole("button", { name: "Kopirano" }),
    ).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      token,
    );
    await dialog.getByRole("button", { name: "Gotovo" }).click();

    // listed by name and prefix, never again in full
    const listed = row(section, "MCP na laptopu");
    await expect(listed).toContainText(`${token.slice(0, 12)}…`);
    await expect(listed).toContainText("Samo čitanje");
    await expect(listed).toContainText("Nikad korišten");
    await expect(listed).toContainText("Istječe");
    await expect(page.getByText(token)).toHaveCount(0);
    await page.reload();
    await expect(page.getByText(token)).toHaveCount(0);

    // the database only has its hash, and it expires in 90 days
    const stored = await prisma.apiToken.findFirstOrThrow({
      where: { userId: user.id },
    });
    expect(stored.tokenHash).not.toContain(token);
    expect(stored.expiresAt!.getTime() - Date.now()).toBeGreaterThan(89 * DAY);
    expect(stored.expiresAt!.getTime() - Date.now()).toBeLessThan(91 * DAY);

    // it reads as the user, but may not write
    const response = await me(page.request, token);
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({
      id: user.id,
      tokenId: stored.id,
    });
    const write = await page.request.patch(`${API_URL}/users/language`, {
      headers: { ...bearer(token), "Accept-Language": "hr" },
      data: { language: "EN" },
    });
    expect(write.status()).toBe(403);
    expect((await write.json()).message).toBe("Ovaj token smije samo čitati");

    // last use and the usage per day show up in the list
    await page.reload();
    await expect(row(section, "MCP na laptopu")).toContainText(
      "Zadnje korišten",
    );
    await row(section, "MCP na laptopu")
      .getByRole("button", { name: "Korištenje" })
      .click();
    await expect(row(section, "MCP na laptopu")).toContainText(
      "2 zahtjeva u zadnjih 30 dana",
    );
  });

  test("a read and write token changes data as its user, but cannot manage tokens or the account", async ({
    page,
  }) => {
    const user = await createUser({ language: "HR" });
    const { section } = await openTokens(page, user);
    const token = await createTokenInUi(page, section, {
      name: "Integracija",
      access: "Čitanje i pisanje",
    });
    await expect(row(section, "Integracija")).toContainText(
      "Čitanje i pisanje",
    );

    const write = await page.request.patch(`${API_URL}/users/language`, {
      headers: bearer(token),
      data: { language: "EN" },
    });
    expect(write.status()).toBe(200);
    await expect
      .poll(
        async () =>
          (await prisma.user.findUniqueOrThrow({ where: { id: user.id } }))
            .language,
      )
      .toBe("EN");

    for (const [method, path] of [
      ["get", "/auth/tokens"],
      ["post", "/auth/tokens"],
      ["delete", "/auth/tokens"],
      ["delete", "/users"],
    ] as const) {
      const response = await page.request[method](`${API_URL}${path}`, {
        headers: bearer(token),
        data:
          method === "post"
            ? { name: "Još jedan", scopes: ["READ"] }
            : undefined,
      });
      expect(response.status(), `${method} ${path}`).toBe(403);
      expect((await response.json()).message).toBe(
        "This action needs a login, not an API token",
      );
    }
    expect(await prisma.apiToken.count()).toBe(1);
    expect(await prisma.user.count({ where: { id: user.id } })).toBe(1);
  });

  test("a token that never expires is created only after a clear warning", async ({
    page,
  }) => {
    const user = await createUser();
    const { section } = await openTokens(page, user);
    await fillTokenForm(page, section, { name: "Zauvijek" });
    const dialog = modal(page);
    await expect(dialog.getByRole("alert")).toHaveCount(0);

    await dialog.getByRole("combobox").selectOption("never");
    const warning = dialog.getByRole("alert");
    await expect(warning).toContainText("Ovaj token nikad neće isteći");
    await expect(warning).toContainText("čak i ako procuri");
    await dialog.getByRole("button", { name: "Napravi token" }).click();
    await dialog.getByRole("button", { name: "Gotovo" }).click();

    await expect(row(section, "Zauvijek")).toContainText("Nikad ne istječe");
    expect((await prisma.apiToken.findFirstOrThrow()).expiresAt).toBeNull();
  });

  test("a custom expiry has to be a whole number of days up to a year", async ({
    page,
  }) => {
    const user = await createUser();
    const { section } = await openTokens(page, user);
    await fillTokenForm(page, section, {
      name: "Dva tjedna",
      expiry: "custom",
      days: "400",
    });
    const dialog = modal(page);
    await dialog.getByRole("button", { name: "Napravi token" }).click();
    await expect(
      dialog.getByText("Upišite cijeli broj dana od 1 do 365"),
    ).toBeVisible();
    expect(await prisma.apiToken.count()).toBe(0);

    await dialog.getByRole("spinbutton").fill("14");
    await dialog.getByRole("button", { name: "Napravi token" }).click();
    await expect(dialog.getByTestId("new-api-token")).toBeVisible();
    const { expiresAt } = await prisma.apiToken.findFirstOrThrow();
    expect(expiresAt!.getTime() - Date.now()).toBeGreaterThan(13.9 * DAY);
    expect(expiresAt!.getTime() - Date.now()).toBeLessThan(14.1 * DAY);
  });

  test("a token needs a name", async ({ page }) => {
    const user = await createUser();
    const { section } = await openTokens(page, user);
    await fillTokenForm(page, section, { name: "   " });
    await modal(page).getByRole("button", { name: "Napravi token" }).click();
    await expect(modal(page).getByText("Dajte tokenu naziv")).toBeVisible();
    expect(await prisma.apiToken.count()).toBe(0);
  });

  test("the eleventh active token is refused with the reason", async ({
    page,
  }) => {
    const user = await createUser();
    const { jwt, section } = await openTokens(page, user);
    for (let i = 0; i < 10; i++)
      await createTokenViaApi(page.request, jwt, { name: `T${i}` });

    await fillTokenForm(page, section, { name: "Jedanaesti" });
    await modal(page).getByRole("button", { name: "Napravi token" }).click();
    await expect(
      page.getByText("Možete imati najviše 10 aktivnih API tokena"),
    ).toBeVisible();
    await expect(modal(page).getByTestId("new-api-token")).toHaveCount(0);
    expect(await prisma.apiToken.count()).toBe(10);
  });
});

test.describe("revoking API tokens", () => {
  test("revoking a token stops it at once and keeps it in the list", async ({
    page,
  }) => {
    const user = await createUser();
    const { section } = await openTokens(page, user);
    const token = await createTokenInUi(page, section, { name: "Stari" });
    expect((await me(page.request, token)).status()).toBe(200);

    // cancelling the confirmation keeps the token
    page.once("dialog", (dialog) => dialog.dismiss());
    await row(section, "Stari")
      .getByRole("button", { name: "Opozovi", exact: true })
      .click();
    expect((await me(page.request, token)).status()).toBe(200);

    page.once("dialog", (dialog) => {
      expect(dialog.message()).toContain("Opozvati token Stari?");
      void dialog.accept();
    });
    await row(section, "Stari")
      .getByRole("button", { name: "Opozovi", exact: true })
      .click();
    await expect(row(section, "Stari")).toContainText("Opozvan");
    await expect(
      row(section, "Stari").getByRole("button", {
        name: "Opozovi",
        exact: true,
      }),
    ).toHaveCount(0);

    const refused = await me(page.request, token);
    expect(refused.status()).toBe(401);
    expect((await refused.json()).message).toBe(
      "Invalid, expired or revoked API token",
    );
  });

  test("revoke all stops every active token", async ({ page }) => {
    const user = await createUser();
    const { jwt, section } = await openTokens(page, user);
    const first = await createTokenViaApi(page.request, jwt, { name: "Prvi" });
    const second = await createTokenViaApi(page.request, jwt, {
      name: "Drugi",
    });
    await page.reload();

    page.once("dialog", (dialog) => {
      expect(dialog.message()).toContain("2 aktivna tokena");
      void dialog.accept();
    });
    await section.getByRole("button", { name: "Opozovi sve tokene" }).click();
    await expect(row(section, "Prvi")).toContainText("Opozvan");
    await expect(row(section, "Drugi")).toContainText("Opozvan");
    await expect(
      section.getByRole("button", { name: "Opozovi sve tokene" }),
    ).toHaveCount(0);
    for (const { token } of [first, second])
      expect((await me(page.request, token)).status()).toBe(401);
  });

  test("an expired token is shown as expired and no longer works", async ({
    page,
  }) => {
    const user = await createUser();
    const { jwt, section } = await openTokens(page, user);
    const { id, token } = await createTokenViaApi(page.request, jwt, {
      name: "Istekli",
      expiresInDays: 1,
    });
    await prisma.apiToken.update({
      where: { id },
      data: { expiresAt: new Date(Date.now() - DAY) },
    });
    await page.reload();

    await expect(row(section, "Istekli")).toContainText("Istekao");
    await expect(
      row(section, "Istekli").getByRole("button", {
        name: "Opozovi",
        exact: true,
      }),
    ).toHaveCount(0);
    expect((await me(page.request, token)).status()).toBe(401);
  });
});

test.describe("who sees API tokens", () => {
  test("a super user editing someone else's profile does not see their tokens", async ({
    page,
  }) => {
    const owner = await createUser({ username: "vlasnik_tokena" });
    const admin = await createUser({ role: "SUPER" });
    await prisma.apiToken.create({
      data: {
        userId: owner.id,
        name: "Tajni",
        tokenHash: "x".repeat(64),
        prefix: "abcdefgh",
        scopes: ["READ"],
      },
    });
    await loginAs(page, admin);
    await page.goto(`/user/${owner.id}`);
    await expect(page.getByText("Uredi profil")).toBeVisible();
    await expect(page.getByRole("region", { name: "API tokeni" })).toHaveCount(
      0,
    );
    await expect(page.getByText("Tajni")).toHaveCount(0);
  });

  test("other users' profiles have no token section", async ({ page }) => {
    const owner = await createUser();
    const visitor = await createUser();
    await loginAs(page, visitor);
    await page.goto(`/user/${owner.id}`);
    await expect(page.getByRole("region", { name: "API tokeni" })).toHaveCount(
      0,
    );
  });

  test("the section is translated into English", async ({ page, context }) => {
    const user = await createUser({ language: "EN" });
    await context.addCookies([
      {
        name: "NEXT_LOCALE",
        value: "en",
        domain: new URL(WEB_URL).hostname,
        path: "/",
      },
    ]);
    await loginAs(page, user);
    await page.goto(`/user/${user.id}`);
    const section = page.getByRole("region", { name: "API tokens" });
    await expect(section).toBeVisible();
    await expect(
      section.getByText("You have no API tokens yet."),
    ).toBeVisible();
    await section.getByRole("button", { name: "New token" }).click();
    await modal(page).getByRole("combobox").selectOption("never");
    await expect(modal(page).getByRole("alert")).toContainText(
      "This token will never expire",
    );
  });
});

test.describe("rate limit", () => {
  test("a token gets 120 requests a minute and its user hears at 80% and 100%", async ({
    page,
  }) => {
    const user = await createUser();
    const { jwt } = await openTokens(page, user);
    const { token } = await createTokenViaApi(page.request, jwt, {
      name: "Brza skripta",
    });

    for (let i = 1; i <= 120; i++) {
      const response = await me(page.request, token);
      expect(response.status(), `request ${i}`).toBe(200);
    }
    const refused = await me(page.request, token);
    expect(refused.status()).toBe(429);
    expect(refused.headers()["retry-after"]).toBeTruthy();
    expect(refused.headers()["x-ratelimit-remaining"]).toBe("0");
    // the login itself is not limited
    expect(
      (
        await page.request.get(`${API_URL}/auth/me`, { headers: bearer(jwt) })
      ).status(),
    ).toBe(200);

    const bell = page.locator('button[title="notifications"]');
    await expect(bell).toContainText("2", { timeout: 15_000 });
    await bell.click();
    await expect(
      modal(page).getByText("API token Brza skripta se približava ograničenju"),
    ).toBeVisible();
    await expect(
      modal(page).getByText("API token Brza skripta dosegnuo je ograničenje"),
    ).toBeVisible();
    await expect(
      modal(page).getByText(/poslao je 96 od 120 zahtjeva/),
    ).toBeVisible();
  });
});

test.describe("password reset and API tokens", () => {
  const reset = async (page: Page, userId: string) => {
    const NEW_PASSWORD = "N3w!Passw0rd-xyz";
    await page.goto(`/resetPassword/${await createPasswordResetToken(userId)}`);
    await page.getByPlaceholder("Nova lozinka").fill(NEW_PASSWORD);
    await page.getByPlaceholder("Potvrdi lozinku").fill(NEW_PASSWORD);
    await page.getByRole("button", { name: "Resetiraj lozinku" }).click();
  };

  // A token made with a login from another browser, before the reset.
  const tokenFor = async (request: APIRequestContext, email: string) => {
    const login = await request.post(`${API_URL}/auth/login`, {
      data: { email, password: "Str0ng!Passw0rd" },
    });
    return createTokenViaApi(request, (await login.json()).access_token, {
      name: "Prije resetiranja",
    });
  };

  test("right after the reset the user is asked about their tokens and can revoke them", async ({
    page,
  }) => {
    const user = await createUser();
    const { token } = await tokenFor(page.request, user.email);

    await reset(page, user.id);
    const prompt = modal(page);
    await expect(
      prompt.getByRole("heading", { name: "Opozvati vaše API tokene?" }),
    ).toBeVisible();
    await expect(prompt).toContainText("Imate 1 aktivni API token");
    // the reset did not revoke it
    expect((await me(page.request, token)).status()).toBe(200);

    await prompt.getByRole("button", { name: "Opozovi sve tokene" }).click();
    await page.waitForURL("**/discover");
    expect((await me(page.request, token)).status()).toBe(401);
    // and the user is logged in with the new password
    expect(
      await page.evaluate(() => localStorage.getItem("access_token")),
    ).toBeTruthy();
  });

  test("the user can keep their tokens after the reset", async ({ page }) => {
    const user = await createUser();
    const { token } = await tokenFor(page.request, user.email);

    await reset(page, user.id);
    await modal(page).getByRole("button", { name: "Zadrži ih" }).click();
    await page.waitForURL("**/discover");
    expect((await me(page.request, token)).status()).toBe(200);
  });

  test("without tokens there is nothing to ask", async ({ page }) => {
    const user = await createUser();
    await reset(page, user.id);
    await page.waitForURL("**/discover", { timeout: 15_000 });
    await expect(page.getByText("Opozvati vaše API tokene?")).toHaveCount(0);
  });
});
