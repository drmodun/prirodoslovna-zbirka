import {
  createAuthorshipInfo,
  createExponat,
  createOrganisation,
  createPost,
  createUser,
} from "../support/db";
import { expect, loginAs, test } from "../support/fixtures";

test.describe("browsing the collection", () => {
  test("the landing page links to the three kinds of content", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Vaša digitalna zbirka." })).toBeVisible();
    await page.getByRole("link", { name: "Pregledaj" }).first().click();
    await page.waitForURL(/\/discover\?kind=exponat/);
  });

  test("discover lists approved exponats, organisations and posts, and hides pending ones", async ({
    page,
  }) => {
    const author = await createUser();
    const org = await createOrganisation({ name: "Prirodoslovni muzej" }, [
      { userId: author.id, role: "OWNER" },
    ]);
    const visible = await createExponat(org.id, { name: "Kristal kvarca" });
    await createExponat(org.id, { name: "Skriveni mineral", isApproved: false });
    await createPost(author.id, visible.id, { title: "Kako nastaje kvarc" });

    await page.goto("/discover?kind=exponat");
    await expect(page.getByRole("link", { name: "Kristal kvarca" })).toBeVisible();
    await expect(page.getByText("Skriveni mineral")).toHaveCount(0);

    await page.getByRole("button", { name: "Organizacije" }).click();
    await expect(page.getByText("Prirodoslovni muzej").first()).toBeVisible();

    await page.getByRole("button", { name: "Objave" }).click();
    await expect(page.getByRole("link", { name: "Kako nastaje kvarc" })).toBeVisible();
  });

  // BUG: the discover query for posts only checks that the *exponat* is
  // approved (`where e."isApproved" = true`), never the post itself, so posts
  // that are waiting for moderation are shown to every visitor.
  test.fail("discover does not list posts that are waiting for approval", async ({ page }) => {
    const author = await createUser();
    const org = await createOrganisation({}, [{ userId: author.id, role: "MEMBER" }]);
    const exponat = await createExponat(org.id);
    await createPost(author.id, exponat.id, { title: "Neodobrena objava", isApproved: false });

    await page.goto("/discover?kind=post");
    await expect(page.getByText("Nema rezultata")).toBeVisible();
    await expect(page.getByText("Neodobrena objava")).toHaveCount(0);
  });

  test("an empty collection says there are no results", async ({ page }) => {
    await page.goto("/discover?kind=organisation");
    await expect(page.getByText("Nema rezultata")).toBeVisible();
  });

  test("an exponat card opens the exponat page with its details", async ({ page }) => {
    const org = await createOrganisation({ name: "Muzej minerala" });
    await createExponat(org.id, {
      name: "Ametist",
      alternateName: "Kvarc ljubičasti",
    });

    await page.goto("/discover?kind=exponat");
    await page.getByRole("link", { name: "Pogledaj eksponat" }).first().click();
    await page.waitForURL(/\/exponat\/[0-9a-f-]+$/);
    await expect(page.getByText("Ametist").first()).toBeVisible();
    await expect(page.getByText("Opis testnog eksponata").first()).toBeVisible();
    await expect(page.getByText("Muzej minerala").first()).toBeVisible();
  });

  test("an exponat that is not approved is not shown to visitors", async ({ page }) => {
    const org = await createOrganisation();
    const pending = await createExponat(org.id, { name: "Tajni mineral", isApproved: false });
    await page.goto(`/exponat/${pending.id}`);
    // visitors are sent to the admin page, which has nothing to show them
    await page.waitForURL(`**/exponat/${pending.id}/admin`);
    await expect(page.getByText("Tajni mineral")).toHaveCount(0);
  });
});

test.describe("search", () => {
  test("the menu search finds an exponat by name", async ({ page }) => {
    const org = await createOrganisation();
    await createExponat(org.id, { name: "Crvena lisica" });
    await createExponat(org.id, { name: "Sivi vuk" });

    await page.goto("/discover");
    await page.locator('button[class*="Hamburger_container"]').click();
    await page.getByPlaceholder("Pretraži...").fill("lisica");
    await page.locator('a[class*="SingleInput_image"]').click();
    await page.waitForURL(/\/search\?name=lisica/);

    await expect(page.getByRole("link", { name: "Crvena lisica" })).toBeVisible();
    await expect(page.getByText("Sivi vuk")).toHaveCount(0);
  });

  test("the exponat filter narrows the results and shows them in the URL", async ({ page }) => {
    const org = await createOrganisation();
    await createExponat(org.id, { name: "Crvena lisica" });
    await createExponat(org.id, { name: "Sivi vuk" });

    await page.goto("/search?kind=exponat");
    await expect(page.getByRole("link", { name: "Sivi vuk" })).toBeVisible();
    await page.getByPlaceholder("Naziv", { exact: true }).fill("vuk");
    // the side menu has a search link too, but it comes after the page content
    await page.getByRole("link", { name: "Pretraži" }).first().click();
    await page.waitForURL(/name=vuk/);
    await expect(page.getByRole("link", { name: "Sivi vuk" })).toBeVisible();
    await expect(page.getByText("Crvena lisica")).toHaveCount(0);
  });

  test("searching for users, organisations and posts uses separate tabs", async ({ page }) => {
    const author = await createUser({ username: "marko_biolog" });
    const org = await createOrganisation({ name: "Botanički vrt" }, [{ userId: author.id, role: "OWNER" }]);
    const exponat = await createExponat(org.id);
    await createPost(author.id, exponat.id, { title: "Biljke vrta" });

    await page.goto("/search?kind=user&username=marko");
    await expect(page.getByText("marko_biolog").first()).toBeVisible();

    await page.getByRole("button", { name: "Organizacije" }).click();
    await expect(page.getByText("Botanički vrt").first()).toBeVisible();

    await page.getByRole("button", { name: "Objave" }).click();
    await expect(page.getByRole("link", { name: "Biljke vrta" })).toBeVisible();
  });
});

test.describe("user profile", () => {
  test("a profile shows the user's name and approved posts", async ({ page }) => {
    const author = await createUser({ firstName: "Petra", lastName: "Perić" });
    const org = await createOrganisation({}, [{ userId: author.id, role: "MEMBER" }]);
    const exponat = await createExponat(org.id);
    await createPost(author.id, exponat.id, { title: "Moja prva objava" });
    await createAuthorshipInfo(author.id);

    await page.goto(`/user/${author.id}`);
    await expect(page.getByText("Petra Perić").first()).toBeVisible();
    await page.getByRole("button", { name: "Kreacije" }).click();
    await expect(page.getByText("Moja prva objava").first()).toBeVisible();
  });

  // BUG: the user page maps `savedLiterature` before checking the user exists,
  // so an unknown profile is a server error instead of a "not found" page.
  test.fail("an unknown profile shows the not found page", async ({ page }) => {
    const response = await page.goto("/user/00000000-0000-0000-0000-000000000000");
    expect(response?.status()).toBe(404);
  });
});

test("signed in users get the same collection (smoke)", async ({ page }) => {
  const user = await createUser();
  await loginAs(page, user);
  const org = await createOrganisation();
  await createExponat(org.id, { name: "Pirit" });
  await page.goto("/discover?kind=exponat");
  await expect(page.getByRole("link", { name: "Pirit" })).toBeVisible();
});
