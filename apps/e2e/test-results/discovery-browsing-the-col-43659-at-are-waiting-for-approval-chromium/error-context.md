# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: discovery.spec.ts >> browsing the collection >> discover does not list posts that are waiting for approval
- Location: tests/discovery.spec.ts:43:8

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Nema rezultata')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Nema rezultata') with timeout 10000ms
  - waiting for getByText('Nema rezultata')

```

```yaml
- link "logo":
  - /url: /
  - img "logo"
- button
- button "Organizacije"
- button "Eksponati"
- button "Objave"
- button "Radovi"
- button "Radovi (GBIF)"
- button "list za like":
  - img "list za like"
- img "Neodobrena objava"
- text: 13. 10. 2026. 00:58:34
- link "Neodobrena objava":
  - /url: /post/3d585b73-f667-4f29-9ecf-71ee2897aaab
- img "like"
- img "user_c8fe34a0"
- link "user_c8fe34a0":
  - /url: /user/eef0a6c6-73c3-4994-9e71-304b442367ee
- 'link "eksponat: Eksponat c49455cb"':
  - /url: /exponat/ebc00eca-eded-4c7b-aa10-a1c58087d7b6
- img "back to top arrow"
- button "seriski broj":
  - figure: "#"
- img "leaf"
- img "logo"
- text: Biosfera
- link "Dokumentacija":
  - /url: https://biosfera-files.s3.eu-north-1.amazonaws.com/Biosfera+-+Nova+tehni%C4%8Dka+dokumentacija.pdf
- img "placeholder"
- paragraph: Niste prijavljeni
- paragraph
- link "icon":
  - /url: /login
  - button "icon":
    - img "icon"
- link "icon":
  - /url: /discover
  - button "icon":
    - img "icon"
- button "icon":
  - img "icon"
- link "Pretraži...":
  - /url: /search?name=
  - img "Pretraži..."
- textbox "Pretraži..."
- button "microphone":
  - img "microphone"
- alert
```

# Test source

```ts
  1   | import {
  2   |   createAuthorshipInfo,
  3   |   createExponat,
  4   |   createOrganisation,
  5   |   createPost,
  6   |   createUser,
  7   | } from "../support/db";
  8   | import { expect, loginAs, test } from "../support/fixtures";
  9   | 
  10  | test.describe("browsing the collection", () => {
  11  |   test("the landing page links to the three kinds of content", async ({ page }) => {
  12  |     await page.goto("/");
  13  |     await expect(page.getByRole("heading", { name: "Vaša digitalna zbirka." })).toBeVisible();
  14  |     await page.getByRole("link", { name: "Pregledaj" }).first().click();
  15  |     await page.waitForURL(/\/discover\?kind=exponat/);
  16  |   });
  17  | 
  18  |   test("discover lists approved exponats, organisations and posts, and hides pending ones", async ({
  19  |     page,
  20  |   }) => {
  21  |     const author = await createUser();
  22  |     const org = await createOrganisation({ name: "Prirodoslovni muzej" }, [
  23  |       { userId: author.id, role: "OWNER" },
  24  |     ]);
  25  |     const visible = await createExponat(org.id, { name: "Kristal kvarca" });
  26  |     await createExponat(org.id, { name: "Skriveni mineral", isApproved: false });
  27  |     await createPost(author.id, visible.id, { title: "Kako nastaje kvarc" });
  28  | 
  29  |     await page.goto("/discover?kind=exponat");
  30  |     await expect(page.getByRole("link", { name: "Kristal kvarca" })).toBeVisible();
  31  |     await expect(page.getByText("Skriveni mineral")).toHaveCount(0);
  32  | 
  33  |     await page.getByRole("button", { name: "Organizacije" }).click();
  34  |     await expect(page.getByText("Prirodoslovni muzej").first()).toBeVisible();
  35  | 
  36  |     await page.getByRole("button", { name: "Objave" }).click();
  37  |     await expect(page.getByRole("link", { name: "Kako nastaje kvarc" })).toBeVisible();
  38  |   });
  39  | 
  40  |   // BUG: the discover query for posts only checks that the *exponat* is
  41  |   // approved (`where e."isApproved" = true`), never the post itself, so posts
  42  |   // that are waiting for moderation are shown to every visitor.
  43  |   test.fail("discover does not list posts that are waiting for approval", async ({ page }) => {
  44  |     const author = await createUser();
  45  |     const org = await createOrganisation({}, [{ userId: author.id, role: "MEMBER" }]);
  46  |     const exponat = await createExponat(org.id);
  47  |     await createPost(author.id, exponat.id, { title: "Neodobrena objava", isApproved: false });
  48  | 
  49  |     await page.goto("/discover?kind=post");
> 50  |     await expect(page.getByText("Nema rezultata")).toBeVisible();
      |                                                    ^ Error: expect(locator).toBeVisible() failed
  51  |     await expect(page.getByText("Neodobrena objava")).toHaveCount(0);
  52  |   });
  53  | 
  54  |   test("an empty collection says there are no results", async ({ page }) => {
  55  |     await page.goto("/discover?kind=organisation");
  56  |     await expect(page.getByText("Nema rezultata")).toBeVisible();
  57  |   });
  58  | 
  59  |   test("an exponat card opens the exponat page with its details", async ({ page }) => {
  60  |     const org = await createOrganisation({ name: "Muzej minerala" });
  61  |     await createExponat(org.id, {
  62  |       name: "Ametist",
  63  |       alternateName: "Kvarc ljubičasti",
  64  |     });
  65  | 
  66  |     await page.goto("/discover?kind=exponat");
  67  |     await page.getByRole("link", { name: "Pogledaj eksponat" }).first().click();
  68  |     await page.waitForURL(/\/exponat\/[0-9a-f-]+$/);
  69  |     await expect(page.getByText("Ametist").first()).toBeVisible();
  70  |     await expect(page.getByText("Opis testnog eksponata").first()).toBeVisible();
  71  |     await expect(page.getByText("Muzej minerala").first()).toBeVisible();
  72  |   });
  73  | 
  74  |   test("an exponat that is not approved is not shown to visitors", async ({ page }) => {
  75  |     const org = await createOrganisation();
  76  |     const pending = await createExponat(org.id, { name: "Tajni mineral", isApproved: false });
  77  |     await page.goto(`/exponat/${pending.id}`);
  78  |     // visitors are sent to the admin page, which has nothing to show them
  79  |     await page.waitForURL(`**/exponat/${pending.id}/admin`);
  80  |     await expect(page.getByText("Tajni mineral")).toHaveCount(0);
  81  |   });
  82  | });
  83  | 
  84  | test.describe("search", () => {
  85  |   test("the menu search finds an exponat by name", async ({ page }) => {
  86  |     const org = await createOrganisation();
  87  |     await createExponat(org.id, { name: "Crvena lisica" });
  88  |     await createExponat(org.id, { name: "Sivi vuk" });
  89  | 
  90  |     await page.goto("/discover");
  91  |     await page.locator('button[class*="Hamburger_container"]').click();
  92  |     await page.getByPlaceholder("Pretraži...").fill("lisica");
  93  |     await page.locator('a[class*="SingleInput_image"]').click();
  94  |     await page.waitForURL(/\/search\?name=lisica/);
  95  | 
  96  |     await expect(page.getByRole("link", { name: "Crvena lisica" })).toBeVisible();
  97  |     await expect(page.getByText("Sivi vuk")).toHaveCount(0);
  98  |   });
  99  | 
  100 |   test("the exponat filter narrows the results and shows them in the URL", async ({ page }) => {
  101 |     const org = await createOrganisation();
  102 |     await createExponat(org.id, { name: "Crvena lisica" });
  103 |     await createExponat(org.id, { name: "Sivi vuk" });
  104 | 
  105 |     await page.goto("/search?kind=exponat");
  106 |     await expect(page.getByRole("link", { name: "Sivi vuk" })).toBeVisible();
  107 |     await page.getByPlaceholder("Naziv", { exact: true }).fill("vuk");
  108 |     // the side menu has a search link too, but it comes after the page content
  109 |     await page.getByRole("link", { name: "Pretraži" }).first().click();
  110 |     await page.waitForURL(/name=vuk/);
  111 |     await expect(page.getByRole("link", { name: "Sivi vuk" })).toBeVisible();
  112 |     await expect(page.getByText("Crvena lisica")).toHaveCount(0);
  113 |   });
  114 | 
  115 |   test("searching for users, organisations and posts uses separate tabs", async ({ page }) => {
  116 |     const author = await createUser({ username: "marko_biolog" });
  117 |     const org = await createOrganisation({ name: "Botanički vrt" }, [{ userId: author.id, role: "OWNER" }]);
  118 |     const exponat = await createExponat(org.id);
  119 |     await createPost(author.id, exponat.id, { title: "Biljke vrta" });
  120 | 
  121 |     await page.goto("/search?kind=user&username=marko");
  122 |     await expect(page.getByText("marko_biolog").first()).toBeVisible();
  123 | 
  124 |     await page.getByRole("button", { name: "Organizacije" }).click();
  125 |     await expect(page.getByText("Botanički vrt").first()).toBeVisible();
  126 | 
  127 |     await page.getByRole("button", { name: "Objave" }).click();
  128 |     await expect(page.getByRole("link", { name: "Biljke vrta" })).toBeVisible();
  129 |   });
  130 | });
  131 | 
  132 | test.describe("user profile", () => {
  133 |   test("a profile shows the user's name and approved posts", async ({ page }) => {
  134 |     const author = await createUser({ firstName: "Petra", lastName: "Perić" });
  135 |     const org = await createOrganisation({}, [{ userId: author.id, role: "MEMBER" }]);
  136 |     const exponat = await createExponat(org.id);
  137 |     await createPost(author.id, exponat.id, { title: "Moja prva objava" });
  138 |     await createAuthorshipInfo(author.id);
  139 | 
  140 |     await page.goto(`/user/${author.id}`);
  141 |     await expect(page.getByText("Petra Perić").first()).toBeVisible();
  142 |     await page.getByRole("button", { name: "Kreacije" }).click();
  143 |     await expect(page.getByText("Moja prva objava").first()).toBeVisible();
  144 |   });
  145 | 
  146 |   // BUG: the user page maps `savedLiterature` before checking the user exists,
  147 |   // so an unknown profile is a server error instead of a "not found" page.
  148 |   test.fail("an unknown profile shows the not found page", async ({ page }) => {
  149 |     const response = await page.goto("/user/00000000-0000-0000-0000-000000000000");
  150 |     expect(response?.status()).toBe(404);
```