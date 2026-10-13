# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: organisations.spec.ts >> organisation page >> an unknown organisation answers with 404
- Location: tests/organisations.spec.ts:108:8

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 404
Received: 500
```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - generic [ref=f1e2]:
    - generic [ref=f1e4]:
      - link "logo":
        - /url: /
        - img "logo" [ref=f1e5] [cursor=pointer]
    - button [ref=f1e7] [cursor=pointer]
  - generic [ref=f1e12]:
    - generic [ref=f1e13]:
      - generic [ref=f1e14]:
        - img "korisnik" [ref=f1e15]
        - img "korisnik" [ref=f1e16]
      - heading "404 - Stranica nije pronađena!" [level=1] [ref=f1e17]
    - button "seriski broj" [ref=f1e18]:
      - figure [ref=f1e19]: "#"
  - generic [ref=f1e20]:
    - img "leaf" [ref=f1e23]
    - generic [ref=f1e24]:
      - generic [ref=f1e25]:
        - img "logo" [ref=f1e27]
        - generic [ref=f1e28]: Biosfera
      - link "Dokumentacija" [ref=f1e30] [cursor=pointer]:
        - /url: https://biosfera-files.s3.eu-north-1.amazonaws.com/Biosfera+-+Nova+tehni%C4%8Dka+dokumentacija.pdf
  - generic [ref=f1e32]:
    - generic [ref=f1e33]:
      - generic [ref=f1e34]:
        - img "placeholder" [ref=f1e36]
        - generic [ref=f1e37]:
          - paragraph [ref=f1e38]: Niste prijavljeni
          - paragraph
      - generic [ref=f1e39]:
        - link [ref=f1e40] [cursor=pointer]:
          - /url: /login
          - button [ref=f1e41]:
            - img "icon" [ref=f1e42]
        - link [ref=f1e43] [cursor=pointer]:
          - /url: /discover
          - button [ref=f1e44]:
            - img "icon" [ref=f1e45]
        - button [ref=f1e46]:
          - img "icon" [ref=f1e47]
    - generic [ref=f1e48]:
      - link [ref=f1e49] [cursor=pointer]:
        - /url: /search?name=
        - img "Pretraži..." [ref=f1e50]
      - textbox "Pretraži..." [ref=f1e51]
      - button [ref=f1e53]:
        - img "microphone" [ref=f1e55]
  - alert [ref=f1e56]
```

# Test source

```ts
  10  | const LOGO = join(__dirname, "../support/files/logo.png");
  11  | 
  12  | test.describe("creating an organisation", () => {
  13  |   test("a signed in user creates an organisation with a logo and becomes its owner", async ({ page }) => {
  14  |     const user = await createUser();
  15  |     await loginAs(page, user);
  16  | 
  17  |     await page.goto("/createOrganisation");
  18  |     await page.getByPlaceholder("Naziv organizacije").fill("Prirodoslovni muzej Split");
  19  |     await page.getByPlaceholder("Description").fill("Zbirka minerala i fosila");
  20  |     await page.getByPlaceholder("Poveznica na web stranicu").fill("https://pms.example.hr");
  21  |     await page.getByPlaceholder("Adresa e-pošte").fill("info@pms.example.hr");
  22  |     await page.getByRole("combobox").selectOption("SPLITSKO_DALMATINSKA");
  23  |     await page.locator('input[type="file"]').setInputFiles(LOGO);
  24  |     await page.getByRole("button", { name: "Stvori organizaciju" }).click();
  25  | 
  26  |     await page.waitForURL(/\/organisation\/[0-9a-f-]+$/, { timeout: 15_000 });
  27  |     await expect(page.getByText("Prirodoslovni muzej Split").first()).toBeVisible();
  28  | 
  29  |     const stored = await prisma.organisation.findFirstOrThrow({
  30  |       include: { OrganisationUsers: true },
  31  |     });
  32  |     expect(stored).toMatchObject({
  33  |       name: "Prirodoslovni muzej Split",
  34  |       location: "SPLITSKO_DALMATINSKA",
  35  |       email: "info@pms.example.hr",
  36  |     });
  37  |     // the logo went to the API's local storage and is addressed from there
  38  |     expect(stored.mainImage).toMatch(/\/blobs\/file\/organisation\/[0-9a-f-]+$/);
  39  |     expect(stored.OrganisationUsers).toEqual([
  40  |       expect.objectContaining({ userId: user.id, role: "OWNER" }),
  41  |     ]);
  42  |   });
  43  | 
  44  |   test("the uploaded logo can be fetched back from the API", async ({ page, request }) => {
  45  |     const user = await createUser();
  46  |     await loginAs(page, user);
  47  |     await page.goto("/createOrganisation");
  48  |     await page.getByPlaceholder("Naziv organizacije").fill("Muzej s logom");
  49  |     await page.getByPlaceholder("Description").fill("Opis organizacije");
  50  |     await page.getByPlaceholder("Poveznica na web stranicu").fill("https://logo.example.hr");
  51  |     await page.getByPlaceholder("Adresa e-pošte").fill("logo@example.hr");
  52  |     await page.locator('input[type="file"]').setInputFiles(LOGO);
  53  |     await page.getByRole("button", { name: "Stvori organizaciju" }).click();
  54  |     await page.waitForURL(/\/organisation\/[0-9a-f-]+$/, { timeout: 15_000 });
  55  | 
  56  |     const { mainImage } = await prisma.organisation.findFirstOrThrow();
  57  |     const file = await request.get(mainImage);
  58  |     expect(file.status()).toBe(200);
  59  |     expect(file.headers()["content-type"]).toContain("image/png");
  60  |   });
  61  | 
  62  |   test("invalid input is explained and nothing is created", async ({ page }) => {
  63  |     await loginAs(page, await createUser());
  64  |     await page.goto("/createOrganisation");
  65  |     await page.getByPlaceholder("Naziv organizacije").fill("A");
  66  |     await page.getByPlaceholder("Adresa e-pošte").fill("nope");
  67  |     await page.getByPlaceholder("Poveznica na web stranicu").fill("not a url");
  68  |     await page.getByRole("button", { name: "Stvori organizaciju" }).click();
  69  |     await expect(page.getByText("Ime more imati najmanje 2 slova")).toBeVisible();
  70  |     await expect(page.getByText("Adresa e-pošte nije pravilnog formata")).toBeVisible();
  71  |     await expect(page.getByText("Poveznica nije pravilnog formata")).toBeVisible();
  72  |     expect(await prisma.organisation.count()).toBe(0);
  73  |   });
  74  | });
  75  | 
  76  | test.describe("organisation page", () => {
  77  |   test("shows the organisation's details, tabs and statistics", async ({ page }) => {
  78  |     const owner = await createUser({ username: "vlasnik" });
  79  |     const org = await createOrganisation({ name: "Zoološki muzej" }, [
  80  |       { userId: owner.id, role: "OWNER" },
  81  |     ]);
  82  |     await createExponat(org.id, { name: "Opal" });
  83  | 
  84  |     await page.goto(`/organisation/${org.id}`);
  85  |     await expect(page.getByText("Zoološki muzej").first()).toBeVisible();
  86  |     for (const tab of ["Početna", "Eksponati", "Objave", "Članovi", "Radovi"])
  87  |       await expect(page.getByRole("button", { name: tab })).toBeVisible();
  88  | 
  89  |     await page.getByRole("button", { name: "Eksponati" }).click();
  90  |     // exponats are grouped by domain; the default one is eukaryotes
  91  |     await page.getByRole("button", { name: "MINERAL" }).click();
  92  |     await expect(page.getByText("Opal").first()).toBeVisible();
  93  | 
  94  |     await page.getByRole("button", { name: "Članovi" }).click();
  95  |     await expect(page.getByText("vlasnik").first()).toBeVisible();
  96  |     await expect(page.getByText("Vlasnik").first()).toBeVisible();
  97  |   });
  98  | 
  99  |   test("an organisation that is not approved is not shown to visitors", async ({ page }) => {
  100 |     const org = await createOrganisation({ name: "Neodobrena organizacija", isApproved: false });
  101 |     await page.goto(`/organisation/${org.id}`);
  102 |     await expect(page.getByText("Neodobrena organizacija")).toHaveCount(0);
  103 |   });
  104 | 
  105 |   // BUG: for an unknown or unapproved organisation the page hands `null` to
  106 |   // OrganisationBody, which touches `window` while rendering on the server, so
  107 |   // visitors get a server error instead of a 404.
  108 |   test.fail("an unknown organisation answers with 404", async ({ page }) => {
  109 |     const response = await page.goto("/organisation/00000000-0000-0000-0000-000000000000");
> 110 |     expect(response?.status()).toBe(404);
      |                                ^ Error: expect(received).toBe(expected) // Object.is equality
  111 |   });
  112 | 
  113 |   test("only the owner or an admin sees the Edit tab", async ({ page, browser }) => {
  114 |     const owner = await createUser();
  115 |     const stranger = await createUser();
  116 |     const org = await createOrganisation({}, [{ userId: owner.id, role: "OWNER" }]);
  117 | 
  118 |     await loginAs(page, owner);
  119 |     await page.goto(`/organisation/${org.id}`);
  120 |     await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
  121 | 
  122 |     const other = await browser.newPage();
  123 |     await loginAs(other, stranger);
  124 |     await other.goto(`/organisation/${org.id}`);
  125 |     await expect(other.getByRole("button", { name: "Početna" })).toBeVisible();
  126 |     await expect(other.getByRole("button", { name: "Edit" })).toHaveCount(0);
  127 |     await other.close();
  128 |   });
  129 | 
  130 |   test("the owner edits the organisation", async ({ page }) => {
  131 |     const owner = await createUser();
  132 |     const org = await createOrganisation({ name: "Staro ime muzeja" }, [
  133 |       { userId: owner.id, role: "OWNER" },
  134 |     ]);
  135 |     await loginAs(page, owner);
  136 |     await page.goto(`/organisation/${org.id}`);
  137 |     await page.getByRole("button", { name: "Edit" }).click();
  138 |     const name = page.getByPlaceholder("Naziv organizacije");
  139 |     await expect(name).toHaveValue("Staro ime muzeja");
  140 |     await name.fill("Novo ime muzeja");
  141 |     await page.getByRole("button", { name: "Uredi" }).click();
  142 |     await expect
  143 |       .poll(async () => (await prisma.organisation.findUniqueOrThrow({ where: { id: org.id } })).name)
  144 |       .toBe("Novo ime muzeja");
  145 |   });
  146 | });
  147 | 
  148 | test.describe("membership", () => {
  149 |   test("a user asks to join, the owner approves them and they become a member", async ({
  150 |     page,
  151 |     browser,
  152 |   }) => {
  153 |     const owner = await createUser({ username: "vlasnica" });
  154 |     const applicant = await createUser({ username: "podnositelj" });
  155 |     const org = await createOrganisation({ name: "Entomološka zbirka" }, [
  156 |       { userId: owner.id, role: "OWNER" },
  157 |     ]);
  158 | 
  159 |     // the applicant requests membership
  160 |     await loginAs(page, applicant);
  161 |     page.on("dialog", (dialog) => dialog.accept());
  162 |     await page.goto(`/organisation/${org.id}`);
  163 |     await page.getByRole("button", { name: "Postani član" }).click();
  164 |     await expect
  165 |       .poll(() => prisma.organisationUser.findFirst({ where: { userId: applicant.id } }))
  166 |       .toMatchObject({ role: "REQUESTED" });
  167 | 
  168 |     // the owner is notified and approves the request in the members tab
  169 |     const ownerPage = await browser.newPage();
  170 |     ownerPage.on("dialog", (dialog) => dialog.accept());
  171 |     await loginAs(ownerPage, owner);
  172 |     await ownerPage.goto(`/organisation/${org.id}`);
  173 |     await expect(ownerPage.locator('button[title="notifications"]')).toContainText("1");
  174 | 
  175 |     await ownerPage.getByRole("button", { name: "Članovi" }).click();
  176 |     const row = ownerPage.locator('[class*="MembershipCard_container"]', { hasText: "podnositelj" });
  177 |     await expect(row.getByText("Zahtjev")).toBeVisible();
  178 |     await row.getByText("Promijeni ulogu").click();
  179 |     // modals render into #portal, which comes before the page content
  180 |     await ownerPage.locator("#portal").getByRole("combobox").selectOption("MEMBER");
  181 |     await ownerPage.locator("#portal").getByRole("button", { name: "Promijeni ulogu" }).click();
  182 | 
  183 |     await expect
  184 |       .poll(() => prisma.organisationUser.findFirst({ where: { userId: applicant.id } }))
  185 |       .toMatchObject({ role: "MEMBER" });
  186 |     await ownerPage.close();
  187 | 
  188 |     // the applicant now has the member-only controls
  189 |     await page.goto(`/organisation/${org.id}`);
  190 |     await page.getByRole("button", { name: "Eksponati" }).click();
  191 |     await expect(page.getByRole("button", { name: "Dodaj eksponat" })).toBeVisible();
  192 |   });
  193 | 
  194 |   test("a visitor who is not a member does not get the add exponat button", async ({ page }) => {
  195 |     const org = await createOrganisation();
  196 |     await loginAs(page, await createUser());
  197 |     await page.goto(`/organisation/${org.id}`);
  198 |     await page.getByRole("button", { name: "Eksponati" }).click();
  199 |     await expect(page.getByRole("button", { name: "Dodaj eksponat" })).toHaveCount(0);
  200 |   });
  201 | });
  202 | 
```