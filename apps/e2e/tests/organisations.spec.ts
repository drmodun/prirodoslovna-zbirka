import { join } from "node:path";
import {
  createExponat,
  createOrganisation,
  createUser,
  prisma,
} from "../support/db";
import { expect, loginAs, test } from "../support/fixtures";

const LOGO = join(__dirname, "../support/files/logo.png");

test.describe("creating an organisation", () => {
  test("a signed in user creates an organisation with a logo and becomes its owner", async ({ page }) => {
    const user = await createUser();
    await loginAs(page, user);

    await page.goto("/createOrganisation");
    await page.getByPlaceholder("Naziv organizacije").fill("Prirodoslovni muzej Split");
    await page.getByPlaceholder("Opis").fill("Zbirka minerala i fosila");
    await page.getByPlaceholder("Poveznica na web stranicu").fill("https://pms.example.hr");
    await page.getByPlaceholder("Adresa e-pošte").fill("info@pms.example.hr");
    await page.getByRole("combobox").selectOption("SPLITSKO_DALMATINSKA");
    await page.locator('input[type="file"]').setInputFiles(LOGO);
    await page.getByRole("button", { name: "Stvori organizaciju" }).click();

    await page.waitForURL(/\/organisation\/[0-9a-f-]+$/, { timeout: 15_000 });
    await expect(page.getByText("Prirodoslovni muzej Split").first()).toBeVisible();

    const stored = await prisma.organisation.findFirstOrThrow({
      include: { OrganisationUsers: true },
    });
    expect(stored).toMatchObject({
      name: "Prirodoslovni muzej Split",
      location: "SPLITSKO_DALMATINSKA",
      email: "info@pms.example.hr",
    });
    // the logo went to the API's local storage and is addressed from there
    expect(stored.mainImage).toMatch(/\/blobs\/file\/organisation\/[0-9a-f-]+$/);
    expect(stored.OrganisationUsers).toEqual([
      expect.objectContaining({ userId: user.id, role: "OWNER" }),
    ]);
  });

  test("the uploaded logo can be fetched back from the API", async ({ page, request }) => {
    const user = await createUser();
    await loginAs(page, user);
    await page.goto("/createOrganisation");
    await page.getByPlaceholder("Naziv organizacije").fill("Muzej s logom");
    await page.getByPlaceholder("Opis").fill("Opis organizacije");
    await page.getByPlaceholder("Poveznica na web stranicu").fill("https://logo.example.hr");
    await page.getByPlaceholder("Adresa e-pošte").fill("logo@example.hr");
    await page.locator('input[type="file"]').setInputFiles(LOGO);
    await page.getByRole("button", { name: "Stvori organizaciju" }).click();
    await page.waitForURL(/\/organisation\/[0-9a-f-]+$/, { timeout: 15_000 });

    const { mainImage } = await prisma.organisation.findFirstOrThrow();
    const file = await request.get(mainImage);
    expect(file.status()).toBe(200);
    expect(file.headers()["content-type"]).toContain("image/png");
  });

  test("invalid input is explained and nothing is created", async ({ page }) => {
    await loginAs(page, await createUser());
    await page.goto("/createOrganisation");
    await page.getByPlaceholder("Naziv organizacije").fill("A");
    await page.getByPlaceholder("Adresa e-pošte").fill("nope");
    await page.getByPlaceholder("Poveznica na web stranicu").fill("not a url");
    await page.getByRole("button", { name: "Stvori organizaciju" }).click();
    await expect(page.getByText("Ime mora imati najmanje 2 slova")).toBeVisible();
    await expect(page.getByText("Adresa e-pošte nije pravilnog formata")).toBeVisible();
    await expect(page.getByText("Poveznica nije pravilnog formata")).toBeVisible();
    expect(await prisma.organisation.count()).toBe(0);
  });
});

test.describe("organisation page", () => {
  test("shows the organisation's details, tabs and statistics", async ({ page }) => {
    const owner = await createUser({ username: "vlasnik" });
    const org = await createOrganisation({ name: "Zoološki muzej" }, [
      { userId: owner.id, role: "OWNER" },
    ]);
    await createExponat(org.id, { name: "Opal" });

    await page.goto(`/organisation/${org.id}`);
    await expect(page.getByText("Zoološki muzej").first()).toBeVisible();
    for (const tab of ["Početna", "Eksponati", "Objave", "Članovi", "Radovi"])
      await expect(page.getByRole("button", { name: tab })).toBeVisible();

    await page.getByRole("button", { name: "Eksponati" }).click();
    // exponats are grouped by domain; the default one is eukaryotes
    await page.getByRole("button", { name: "MINERAL" }).click();
    await expect(page.getByText("Opal").first()).toBeVisible();

    await page.getByRole("button", { name: "Članovi" }).click();
    await expect(page.getByText("vlasnik").first()).toBeVisible();
    await expect(page.getByText("Vlasnik").first()).toBeVisible();
  });

  test("an organisation that is not approved is not shown to visitors", async ({ page }) => {
    const org = await createOrganisation({ name: "Neodobrena organizacija", isApproved: false });
    await page.goto(`/organisation/${org.id}`);
    await expect(page.getByText("Neodobrena organizacija")).toHaveCount(0);
  });

  test("an unknown organisation answers with 404", async ({ page }) => {
    const response = await page.goto("/organisation/00000000-0000-0000-0000-000000000000");
    expect(response?.status()).toBe(404);
  });

  test("only the owner or an admin sees the Edit tab", async ({ page, browser }) => {
    const owner = await createUser();
    const stranger = await createUser();
    const org = await createOrganisation({}, [{ userId: owner.id, role: "OWNER" }]);

    await loginAs(page, owner);
    await page.goto(`/organisation/${org.id}`);
    await expect(page.getByRole("button", { name: "Uredi" })).toBeVisible();

    const other = await browser.newPage();
    await loginAs(other, stranger);
    await other.goto(`/organisation/${org.id}`);
    await expect(other.getByRole("button", { name: "Početna" })).toBeVisible();
    await expect(other.getByRole("button", { name: "Uredi" })).toHaveCount(0);
    await other.close();
  });

  test("the owner edits the organisation", async ({ page }) => {
    const owner = await createUser();
    const org = await createOrganisation({ name: "Staro ime muzeja" }, [
      { userId: owner.id, role: "OWNER" },
    ]);
    await loginAs(page, owner);
    await page.goto(`/organisation/${org.id}`);
    await page.getByRole("button", { name: "Uredi" }).click();
    const name = page.getByPlaceholder("Naziv organizacije");
    await expect(name).toHaveValue("Staro ime muzeja");
    await name.fill("Novo ime muzeja");
    await page.getByRole("button", { name: "Spremi promjene" }).click();
    await expect
      .poll(async () => (await prisma.organisation.findUniqueOrThrow({ where: { id: org.id } })).name)
      .toBe("Novo ime muzeja");
  });
});

test.describe("membership", () => {
  test("a user asks to join, the owner approves them and they become a member", async ({
    page,
    browser,
  }) => {
    const owner = await createUser({ username: "vlasnica" });
    const applicant = await createUser({ username: "podnositelj" });
    const org = await createOrganisation({ name: "Entomološka zbirka" }, [
      { userId: owner.id, role: "OWNER" },
    ]);

    // the applicant requests membership
    await loginAs(page, applicant);
    page.on("dialog", (dialog) => dialog.accept());
    await page.goto(`/organisation/${org.id}`);
    await page.getByRole("button", { name: "Postani član" }).click();
    await expect
      .poll(() => prisma.organisationUser.findFirst({ where: { userId: applicant.id } }))
      .toMatchObject({ role: "REQUESTED" });

    // the owner is notified and approves the request in the members tab
    const ownerPage = await browser.newPage();
    ownerPage.on("dialog", (dialog) => dialog.accept());
    await loginAs(ownerPage, owner);
    await ownerPage.goto(`/organisation/${org.id}`);
    await expect(ownerPage.locator('button[title="notifications"]')).toContainText("1");

    await ownerPage.getByRole("button", { name: "Članovi" }).click();
    const row = ownerPage.locator('[class*="MembershipCard_container"]', { hasText: "podnositelj" });
    await expect(row.getByText("Zahtjev")).toBeVisible();
    await row.getByText("Promijeni ulogu").click();
    // modals render into #portal, which comes before the page content
    await ownerPage.locator("#portal").getByRole("combobox").selectOption("MEMBER");
    await ownerPage.locator("#portal").getByRole("button", { name: "Promijeni ulogu" }).click();

    await expect
      .poll(() => prisma.organisationUser.findFirst({ where: { userId: applicant.id } }))
      .toMatchObject({ role: "MEMBER" });
    await ownerPage.close();

    // the applicant now has the member-only controls
    await page.goto(`/organisation/${org.id}`);
    await page.getByRole("button", { name: "Eksponati" }).click();
    await expect(page.getByRole("button", { name: "Dodaj eksponat" })).toBeVisible();
  });

  test("a visitor who is not a member does not get the add exponat button", async ({ page }) => {
    const org = await createOrganisation();
    await loginAs(page, await createUser());
    await page.goto(`/organisation/${org.id}`);
    await page.getByRole("button", { name: "Eksponati" }).click();
    await expect(page.getByRole("button", { name: "Dodaj eksponat" })).toHaveCount(0);
  });
});
