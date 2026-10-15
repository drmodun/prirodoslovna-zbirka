import {
  createExponat,
  createOrganisation,
  createPost,
  createUser,
  prisma,
} from "../support/db";
import { expect, loginAs, test } from "../support/fixtures";

test.describe("favourites", () => {
  test("a signed in user favourites an exponat and the choice survives a reload", async ({ page }) => {
    const user = await createUser();
    const org = await createOrganisation();
    const exponat = await createExponat(org.id, { name: "Granit" });
    await loginAs(page, user);

    await page.goto("/discover?kind=exponat");
    const card = page.locator('[class*="ExponatCard_container"]', { hasText: "Granit" });
    await card.getByTitle("like").click();
    await expect
      .poll(() => prisma.favouriteExponat.count({ where: { userId: user.id, ExponatId: exponat.id } }))
      .toBe(1);

    await page.reload();
    await expect(
      page.locator('[class*="ExponatCard_container"]', { hasText: "Granit" }).getByTitle("like"),
    ).toHaveClass(/favourite/);

    // toggling again removes it
    await page.locator('[class*="ExponatCard_container"]', { hasText: "Granit" }).getByTitle("like").click();
    await expect
      .poll(() => prisma.favouriteExponat.count())
      .toBe(0);
  });

  test("visitors who are not signed in are not offered the favourite button", async ({ page }) => {
    const org = await createOrganisation();
    await createExponat(org.id, { name: "Bazalt" });
    await page.goto("/discover?kind=exponat");
    await expect(page.getByRole("link", { name: "Bazalt" })).toBeVisible();
    await expect(page.getByTitle("like")).toHaveCount(0);
  });
});

test.describe("likes", () => {
  test("a user likes a post from the discover feed", async ({ page }) => {
    const author = await createUser();
    const reader = await createUser();
    const org = await createOrganisation({}, [{ userId: author.id, role: "MEMBER" }]);
    const exponat = await createExponat(org.id);
    const post = await createPost(author.id, exponat.id, { title: "Priča o kvarcu" });
    await loginAs(page, reader);

    await page.goto("/discover?kind=post");
    const card = page.locator('[class*="PostCard_container"]', { hasText: "Priča o kvarcu" });
    await card.getByTitle("like").click();
    await expect
      .poll(() => prisma.like.count({ where: { userId: reader.id, postId: post.id } }))
      .toBe(1);
  });
});

test.describe("following", () => {
  test("following a user shows up in both profiles and notifies the followed user", async ({
    page,
    browser,
  }) => {
    const ana = await createUser({ username: "ana_prati" });
    const ivo = await createUser({ username: "ivo_pracen", firstName: "Ivo" });
    await loginAs(page, ana);

    await page.goto(`/user/${ivo.id}`);
    await page.getByTitle("follow user").click();
    await expect(page.getByTitle("follow user")).toHaveText("Prestani pratiti");
    await expect
      .poll(() => prisma.userFollows.count({ where: { followerId: ana.id, followeeId: ivo.id } }))
      .toBe(1);

    // the followed user is told, and the bell shows how many are unread
    const ivoPage = await browser.newPage();
    await loginAs(ivoPage, ivo);
    await ivoPage.goto("/discover");
    await expect(ivoPage.locator('button[title="notifications"]')).toContainText("1");
    await ivoPage.locator('button[title="notifications"]').click();
    await expect(ivoPage.locator("#portal").getByText("Novi pratitelj")).toBeVisible();
    await expect(ivoPage.locator("#portal").getByText("ana_prati")).toBeVisible();

    await ivoPage.locator("#portal").getByRole("button", { name: "Označi sve kao pročitano" }).click();
    await expect
      .poll(() => prisma.userNotification.count({ where: { userId: ivo.id, isRead: false } }))
      .toBe(0);
    await expect(ivoPage.locator('button[title="notifications"]')).toContainText("0");
    await ivoPage.close();

    // the follow list page shows the relationship
    await page.goto(`/follows/${ivo.id}`);
    await expect(page.getByText("ana_prati").first()).toBeVisible();
  });

  test("a user can stop following", async ({ page }) => {
    const ana = await createUser();
    const ivo = await createUser();
    await prisma.userFollows.create({ data: { followerId: ana.id, followeeId: ivo.id } });
    await loginAs(page, ana);
    await page.goto(`/user/${ivo.id}`);
    await expect(page.getByTitle("follow user")).toHaveText("Prestani pratiti");
    await page.getByTitle("follow user").click();
    await expect.poll(() => prisma.userFollows.count()).toBe(0);
  });
});

test.describe("notifications", () => {
  test("a new notification appears in the bell without reloading the page", async ({ page, browser }) => {
    const ana = await createUser();
    const ivo = await createUser();
    await loginAs(page, ivo);
    await page.goto("/discover");
    await expect(page.locator('button[title="notifications"]')).toContainText("0");

    const other = await browser.newPage();
    await loginAs(other, ana);
    await other.goto(`/user/${ivo.id}`);
    await other.getByTitle("follow user").click();

    // pushed over the server-sent events stream
    await expect(page.locator('button[title="notifications"]')).toContainText("1", { timeout: 15_000 });
    await other.close();
  });
});

test.describe("writing a post", () => {
  // BUG: creating a post is broken end to end: the API answers 500 for every
  // request (its DTO's `isAdmin` leaks into the database call), and the web
  // form drops `authorshipInfoId`, which the API requires.
  test.fail("a member writes a post about an exponat", async ({ page }) => {
    const member = await createUser();
    const org = await createOrganisation({}, [{ userId: member.id, role: "MEMBER" }]);
    const exponat = await createExponat(org.id);
    await loginAs(page, member);

    await page.goto(`/exponat/${exponat.id}/createPost`);
    await page.getByPlaceholder("Naslov").fill("Moja objava o mineralu");
    await page
      .getByPlaceholder("Unesite tekst objave, markdown je podržan")
      .fill("Ovo je dovoljno dugačak tekst objave.");
    const files = page.locator('input[type="file"]');
    await files.nth(0).setInputFiles("support/files/logo.png");
    await files.nth(1).setInputFiles("support/files/logo.png");
    await page.getByRole("button", { name: "Napravi objavu" }).click();

    await expect.poll(() => prisma.post.count(), { timeout: 10_000 }).toBe(1);
  });
});
