# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: discovery.spec.ts >> user profile >> an unknown profile shows the not found page
- Location: tests/discovery.spec.ts:148:8

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 404
Received: 500
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - 'heading "Application error: a server-side exception has occurred (see the server logs for more information)." [level=2] [ref=e4]'
  - paragraph [ref=e5]: "Digest: 389079054"
```

# Test source

```ts
  50  |     await expect(page.getByText("Nema rezultata")).toBeVisible();
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
> 150 |     expect(response?.status()).toBe(404);
      |                                ^ Error: expect(received).toBe(expected) // Object.is equality
  151 |   });
  152 | });
  153 | 
  154 | test("signed in users get the same collection (smoke)", async ({ page }) => {
  155 |   const user = await createUser();
  156 |   await loginAs(page, user);
  157 |   const org = await createOrganisation();
  158 |   await createExponat(org.id, { name: "Pirit" });
  159 |   await page.goto("/discover?kind=exponat");
  160 |   await expect(page.getByRole("link", { name: "Pirit" })).toBeVisible();
  161 | });
  162 | 
```