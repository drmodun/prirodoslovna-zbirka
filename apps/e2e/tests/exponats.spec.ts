import { join } from "node:path";
import type { Page } from "@playwright/test";
import {
  createExponat,
  createOrganisation,
  createUser,
  prisma,
} from "../support/db";
import { expect, loginAs, test } from "../support/fixtures";

const IMAGE = join(__dirname, "../support/files/logo.png");

/** Fills in the "add exponat" form for a mineral (no taxonomy lookup needed). */
const fillExponatForm = async (page: Page, name: string) => {
  await page.getByPlaceholder("Ime", { exact: true }).fill(name);
  await page.getByRole("combobox").first().selectOption("MINERAL");
  await page.getByPlaceholder("Nomenklatura").fill("SiO2 kvarc");
  await page.getByPlaceholder("Opis").fill("Tvrdi mineral koji se nalazi u stijenama");

  // fun facts
  await page.getByPlaceholder("Upišite vrijednost").fill("Tvrdoća 7 po Mohsu");
  await page.getByTitle("Dodaj").first().click();

  // attributes
  await page.getByPlaceholder("Atribut", { exact: true }).fill("boja");
  await page.getByPlaceholder("Vrijednost", { exact: true }).fill("bezbojan");
  await page.getByTitle("Dodaj").last().click();

  await page.locator('input[type="file"]').first().setInputFiles(IMAGE);
};

/** Opens the authorship dialog, fills it in and submits it. */
const addAuthorship = async (page: Page) => {
  await page.getByRole("button", { name: "Dodavanje autorskih informacija" }).click();
  const dialog = page.locator("#portal");
  await dialog.getByPlaceholder("Mjesto pronalaska").fill("Papuk");
  await dialog.locator('input[type="date"]').fill("2024-05-01");
  await dialog.getByPlaceholder("Autor").fill("Ana Anić");
  await dialog.getByPlaceholder("Identificirao").fill("Dr. Horvat");
  await dialog.getByPlaceholder("Fotograf").fill("Ivo Ivić");
  await dialog.getByPlaceholder("Naziv uređaja").fill("Canon EOS");
  await dialog.getByPlaceholder("Upišite vrijednost").fill("Hrvatski minerali, 2020.");
  await dialog.getByTitle("Dodaj").click();
  await dialog.getByRole("button", { name: "Pošalji" }).click();
  await expect(dialog.getByText("Dodaj informacije o autorstvu slike")).toBeHidden();
};

test.describe("adding an exponat", () => {
  test("an organisation admin publishes a mineral that is visible straight away", async ({ page }) => {
    const admin = await createUser();
    const org = await createOrganisation({ name: "Muzej minerala" }, [
      { userId: admin.id, role: "ADMIN" },
    ]);
    await loginAs(page, admin);

    await page.goto(`/organisation/${org.id}/createExponat`);
    await fillExponatForm(page, "Planinski kristal");
    await addAuthorship(page);
    await page.getByRole("button", { name: "Pošalji" }).click();

    // the form sends the visitor back to the organisation after saving
    await page.waitForURL(`**/organisation/${org.id}`, { timeout: 15_000 });

    const exponat = await prisma.exponat.findFirstOrThrow();
    expect(exponat).toMatchObject({
      name: "Planinski kristal",
      alternateName: "SiO2 kvarc",
      ExponatKind: "MINERAL",
      organisationId: org.id,
      isApproved: true,
      funFacts: ["Tvrdoća 7 po Mohsu"],
    });
    expect(JSON.parse(exponat.attributes as string)).toEqual({ boja: "bezbojan" });
    expect(exponat.mainImage).toMatch(/\/blobs\/file\/exponat\//);
    expect(exponat.authorshipInfoId).toBeTruthy();

    await page.goto(`/exponat/${exponat.id}`);
    await expect(page.getByText("Planinski kristal").first()).toBeVisible();
    await expect(page.getByText("bezbojan")).toBeVisible();
  });

  test("the authorship dialog saves the place and the date", async ({ page }) => {
    const admin = await createUser();
    const org = await createOrganisation({}, [{ userId: admin.id, role: "ADMIN" }]);
    await loginAs(page, admin);
    await page.goto(`/organisation/${org.id}/createExponat`);
    await addAuthorship(page);

    const info = await prisma.authorshipInfo.findFirstOrThrow();
    expect(info.photographer).toBe("Ivo Ivić");
    expect(info.locationOfOccurrence).toBe("Papuk");
    expect(info.dateOfOccurrence).not.toBeNull();
  });

  test("an incomplete form shows what is missing and saves nothing", async ({ page }) => {
    const admin = await createUser();
    const org = await createOrganisation({}, [{ userId: admin.id, role: "ADMIN" }]);
    await loginAs(page, admin);
    await page.goto(`/organisation/${org.id}/createExponat`);
    await page.getByRole("button", { name: "Pošalji" }).click();
    await expect(page.getByText(/Ime mora imati više od 5 slova/)).toBeVisible();
    expect(await prisma.exponat.count()).toBe(0);
  });

  test("a plain member's exponat waits for approval and the admins are notified", async ({
    page,
    browser,
  }) => {
    const admin = await createUser();
    const member = await createUser();
    const org = await createOrganisation({ name: "Geološki muzej" }, [
      { userId: admin.id, role: "ADMIN" },
      { userId: member.id, role: "MEMBER" },
    ]);

    await loginAs(page, member);
    await page.goto(`/organisation/${org.id}/createExponat`);
    await fillExponatForm(page, "Pirit zlato");
    await addAuthorship(page);
    await page.getByRole("button", { name: "Pošalji" }).click();
    await page.waitForURL(`**/organisation/${org.id}`, { timeout: 15_000 });

    const exponat = await prisma.exponat.findFirstOrThrow();
    expect(exponat.isApproved).toBe(false);

    // visitors do not see it
    await page.goto("/discover?kind=exponat");
    await expect(page.getByText("Pirit zlato")).toHaveCount(0);

    // the admin sees a notification and can publish the exponat
    const adminPage = await browser.newPage();
    await loginAs(adminPage, admin);
    await adminPage.goto(`/organisation/${org.id}`);
    await expect(adminPage.locator('button[title="notifications"]')).toContainText("1");
    await adminPage.getByRole("button", { name: "Eksponati" }).click();
    await adminPage.getByRole("button", { name: "MINERAL" }).click();
    const card = adminPage.locator('[class*="ExponatCard_container"]', { hasText: "Pirit zlato" });
    await card.getByTitle("Odobri").click();
    await expect
      .poll(async () => (await prisma.exponat.findUniqueOrThrow({ where: { id: exponat.id } })).isApproved)
      .toBe(true);
    await adminPage.close();

    await page.goto("/discover?kind=exponat");
    await expect(page.getByRole("link", { name: "Pirit zlato" })).toBeVisible();
  });
});

test.describe("managing exponats", () => {
  test("an admin hides an approved exponat from the public and can remove it", async ({ page, browser }) => {
    const admin = await createUser();
    const org = await createOrganisation({}, [{ userId: admin.id, role: "ADMIN" }]);
    const exponat = await createExponat(org.id, { name: "Halit" });
    await loginAs(page, admin);
    page.on("dialog", (dialog) => dialog.accept());

    await page.goto(`/organisation/${org.id}`);
    await page.getByRole("button", { name: "Eksponati" }).click();
    await page.getByRole("button", { name: "MINERAL" }).click();
    const card = page.locator('[class*="ExponatCard_container"]', { hasText: "Halit" });
    await card.getByTitle("Sakrij").click();
    await expect
      .poll(async () => (await prisma.exponat.findUniqueOrThrow({ where: { id: exponat.id } })).isApproved)
      .toBe(false);

    const visitor = await browser.newPage();
    await visitor.goto("/discover?kind=exponat");
    await expect(visitor.getByText("Halit")).toHaveCount(0);
    await visitor.close();

    await card.getByTitle("Makni eksponat").click();
    await expect.poll(() => prisma.exponat.count()).toBe(0);
  });

  test("a plain member sees no moderation controls", async ({ page }) => {
    const member = await createUser();
    const org = await createOrganisation({}, [{ userId: member.id, role: "MEMBER" }]);
    await createExponat(org.id, { name: "Gips" });
    await loginAs(page, member);
    await page.goto(`/organisation/${org.id}`);
    await page.getByRole("button", { name: "Eksponati" }).click();
    await page.getByRole("button", { name: "MINERAL" }).click();
    await expect(page.getByText("Gips").first()).toBeVisible();
    await expect(page.getByTitle(/^(Odobri|Sakrij)$/)).toHaveCount(0);
    await expect(page.getByTitle("Makni eksponat")).toHaveCount(0);
  });
});
