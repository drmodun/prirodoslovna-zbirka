import type { Page } from "@playwright/test";
import { createPasswordResetToken, createUser, prisma } from "../support/db";
import { expect, loginAs, PASSWORD, test } from "../support/fixtures";

const NEW_USER = {
  firstName: "Ana",
  lastName: "Anić",
  username: "ana_a",
  email: "ana@test.hr",
};

test.describe("registration and activation", () => {
  test("a visitor registers, activates the account from the e-mail link and signs in", async ({
    page,
  }) => {
    await page.goto("/register");
    await page.getByPlaceholder("Ime", { exact: true }).fill(NEW_USER.firstName);
    await page.getByPlaceholder("Prezime").fill(NEW_USER.lastName);
    await page.getByPlaceholder("Korisničko ime").fill(NEW_USER.username);
    await page.getByPlaceholder("Adresa e-pošte").fill(NEW_USER.email);
    await page.getByPlaceholder("Lozinka", { exact: true }).fill(PASSWORD);
    await page.getByPlaceholder("Potvrdi lozinku").fill(PASSWORD);
    await page.getByRole("combobox").selectOption("ZAGREBACKA");
    await page.getByRole("button", { name: "Registrirajte se" }).click();

    // the dialog points to the login page
    await expect(page.getByText("Uspješno napravljen korisnik")).toBeVisible();

    // the account exists but cannot be used before it is activated
    const created = await prisma.user.findUniqueOrThrow({ where: { email: NEW_USER.email } });
    expect(created).toMatchObject({ isActivated: false, role: "USER", location: "ZAGREBACKA" });
    expect(created.password).not.toBe(PASSWORD);

    // the link from the activation e-mail
    await page.goto(`/activateUser/${created.activationCode}`);
    await expect(page.getByRole("heading", { name: /Uspješna verifikacija/ })).toBeVisible();
    expect((await prisma.user.findUniqueOrThrow({ where: { id: created.id } })).isActivated).toBe(true);

    await page.goto("/login");
    await page.getByPlaceholder("Adresa e-pošte").fill(NEW_USER.email);
    await page.getByPlaceholder("Lozinka").fill(PASSWORD);
    await page.getByRole("button", { name: "Prijavite se" }).click();
    await page.waitForURL("**/discover");
    expect(await page.evaluate(() => localStorage.getItem("access_token"))).toBeTruthy();
  });

  test("an invalid registration is stopped in the browser with a reason", async ({ page }) => {
    await page.goto("/register");
    await page.getByPlaceholder("Ime", { exact: true }).fill("A");
    await page.getByPlaceholder("Adresa e-pošte").fill("nope");
    await page.getByPlaceholder("Lozinka", { exact: true }).fill("weak");
    await page.getByRole("button", { name: "Registrirajte se" }).click();
    await expect(page.getByText("Ime mora imati najmanje 2 slova").first()).toBeVisible();
    await expect(page.getByText("Mail mora biti pravilan").first()).toBeVisible();
    await expect(page.getByText(/Lozinka mora imati najmanje 8 znakova/).first()).toBeVisible();
    expect(await prisma.user.count()).toBe(0);
  });

  test("an unknown activation link says so", async ({ page }) => {
    await page.goto("/activateUser/not-a-real-code");
    await expect(page.getByRole("heading", { name: "Greška pri verifikaciji" })).toBeVisible();
  });

  // The API requires `bio` to be a string, but the form always sends the (empty)
  // textarea value, so an optional description is not a problem for visitors.
  test("a visitor can register without filling in the optional description", async ({ page }) => {
    await page.goto("/register");
    await page.getByPlaceholder("Ime", { exact: true }).fill(NEW_USER.firstName);
    await page.getByPlaceholder("Prezime").fill(NEW_USER.lastName);
    await page.getByPlaceholder("Korisničko ime").fill(NEW_USER.username);
    await page.getByPlaceholder("Adresa e-pošte").fill(NEW_USER.email);
    await page.getByPlaceholder("Lozinka", { exact: true }).fill(PASSWORD);
    await page.getByPlaceholder("Potvrdi lozinku").fill(PASSWORD);
    await page.getByRole("combobox").selectOption("ZAGREBACKA");
    await page.getByRole("button", { name: "Registrirajte se" }).click();
    await expect(page.getByText("Uspješno napravljen korisnik")).toBeVisible();
  });
});

const openMenu = (page: Page) =>
  page.locator('button[class*="Hamburger_container"]').click();

test.describe("signing in", () => {
  test("wrong credentials show an error and keep the visitor logged out", async ({ page }) => {
    const user = await createUser();
    await page.goto("/login");
    await page.getByPlaceholder("Adresa e-pošte").fill(user.email);
    await page.getByPlaceholder("Lozinka").fill("Wrong!Passw0rd");
    await page.getByRole("button", { name: "Prijavite se" }).click();
    await expect(page.getByText("Invalid credentials")).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("access_token"))).toBeNull();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("an account that is not activated cannot sign in", async ({ page }) => {
    const user = await createUser({ isActivated: false });
    await page.goto("/login");
    await page.getByPlaceholder("Adresa e-pošte").fill(user.email);
    await page.getByPlaceholder("Lozinka").fill(PASSWORD);
    await page.getByRole("button", { name: "Prijavite se" }).click();
    await expect(page.getByText("User not found")).toBeVisible();
  });

  test("a signed in user sees their name in the menu and can sign out", async ({ page }) => {
    const user = await createUser({ firstName: "Ivo", lastName: "Ivić" });
    await loginAs(page, user);
    await page.goto("/discover");

    await openMenu(page);
    await expect(page.getByText("Ivo Ivić")).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    // user, discover and log out; all three icons share the alt text "icon"
    await page.locator('[class*="IconButton_iconButton"]').nth(2).click();
    await page.waitForURL((url) => url.pathname === "/");
    expect(await page.evaluate(() => localStorage.getItem("access_token"))).toBeNull();
  });

  test("the menu button has an accessible name", async ({ page }) => {
    await page.goto("/discover");
    await expect(page.getByRole("button", { name: /menu/i })).toBeVisible();
  });

  test("a visitor who is not signed in is told to sign in before creating an organisation", async ({
    page,
  }) => {
    const dialog = page.waitForEvent("dialog");
    await page.goto("/createOrganisation");
    expect((await dialog).message()).toContain("prijavljeni");
    await (await dialog).dismiss();
  });
});

test.describe("password reset", () => {
  test("the link from the reset e-mail lets the user choose a new password", async ({ page }) => {
    const user = await createUser();
    const NEW_PASSWORD = "N3w!Passw0rd-xyz";
    const token = await createPasswordResetToken(user.id);

    await page.goto(`/resetPassword/${token}`);
    await page.getByPlaceholder("Nova lozinka").fill(NEW_PASSWORD);
    await page.getByPlaceholder("Potvrdi lozinku").fill(NEW_PASSWORD);
    await page.getByRole("button", { name: "Resetiraj lozinku" }).click();
    await page.waitForURL("**/login", { timeout: 15_000 });

    await page.getByPlaceholder("Adresa e-pošte").fill(user.email);
    await page.getByPlaceholder("Lozinka").fill(PASSWORD);
    await page.getByRole("button", { name: "Prijavite se" }).click();
    await expect(page.getByText("Invalid credentials")).toBeVisible();

    await page.getByPlaceholder("Lozinka").fill(NEW_PASSWORD);
    await page.getByRole("button", { name: "Prijavite se" }).click();
    await page.waitForURL("**/discover");
  });

  test("mismatching passwords are rejected before anything is sent", async ({ page }) => {
    const user = await createUser();
    await page.goto(`/resetPassword/${await createPasswordResetToken(user.id)}`);
    await page.getByPlaceholder("Nova lozinka").fill("N3w!Passw0rd-xyz");
    await page.getByPlaceholder("Potvrdi lozinku").fill("Different1!Pass");
    await page.getByRole("button", { name: "Resetiraj lozinku" }).click();
    await expect(page.getByText("Lozinke se ne poklapaju")).toBeVisible();
  });
});
