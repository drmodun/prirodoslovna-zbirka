# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: exponats.spec.ts >> adding an exponat >> the authorship dialog saves the place and the date
- Location: tests/exponats.spec.ts:85:8

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "Papuk"
Received: null
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e4]:
      - link "logo":
        - /url: /
        - img "logo" [ref=e5] [cursor=pointer]
    - generic [ref=e6]:
      - button "0" [ref=e7]:
        - figure [ref=e10] [cursor=pointer]:
          - img "notification bell" [ref=e11]
      - button [ref=e12] [cursor=pointer]
  - status [ref=e22]: Authorship info uploaded successfully
  - generic [ref=e23]:
    - generic [ref=e24]:
      - generic [ref=e25]:
        - generic [ref=e26]: Kreiraj novi eksponat
        - generic [ref=e28]:
          - generic [ref=e30]:
            - textbox "Ime" [ref=e31]
            - button [ref=e33]:
              - img "microphone" [ref=e35]
          - combobox [ref=e38]:
            - option "Eukariot" [selected]
            - option "Procariot"
            - option "Mineral"
          - textbox "Znanstvena vrsta eksponata" [ref=e41]
          - paragraph [ref=e42]
          - generic [ref=e44]:
            - textbox "Description" [ref=e45]
            - button [ref=e46]:
              - img "microphone" [ref=e48]
          - generic [ref=e49]:
            - generic [ref=e50]: Fun Facts
            - generic [ref=e52]:
              - button [ref=e53]:
                - img "add" [ref=e54]
              - generic [ref=e55]:
                - img "Upišite vrijednost" [ref=e57]
                - textbox "Upišite vrijednost" [ref=e58]
                - button [ref=e60]:
                  - img "microphone" [ref=e62]
          - generic [ref=e64]:
            - generic [ref=e65]: Glavna slika eksponata
            - generic [ref=e66]:
              - button "Choose File" [ref=e67]
              - img "plus" [ref=e69]
              - generic [ref=e70]: Ovdje prenesite datoteke ili kliknite da bi ih dodali
          - generic [ref=e71]:
            - generic [ref=e72]: 3D model
            - generic [ref=e73]:
              - button "Choose File" [ref=e74]
              - img "plus" [ref=e76]
              - generic [ref=e77]: Ovdje prenesite datoteke ili kliknite da bi ih dodali
          - generic [ref=e78]:
            - generic [ref=e79]: Video
            - generic [ref=e80]:
              - button "Choose File" [ref=e81]
              - img "plus" [ref=e83]
              - generic [ref=e84]: Ovdje prenesite datoteke ili kliknite da bi ih dodali
          - button "Dodavanje autorskih informacija" [ref=e86]
          - paragraph [ref=e87]
          - generic [ref=e88]:
            - generic [ref=e89]: Attributes
            - generic [ref=e91]:
              - generic [ref=e92]:
                - generic [ref=e93]:
                  - textbox "Atribut" [ref=e94]
                  - button [ref=e96]:
                    - img "microphone" [ref=e98]
                - generic [ref=e99]:
                  - textbox "Vrijednost" [ref=e100]
                  - button [ref=e102]:
                    - img "microphone" [ref=e104]
              - button [ref=e105]:
                - img "add" [ref=e106]
          - button "Pošalji" [ref=e108]
      - generic [ref=e109]:
        - img "lion" [ref=e111]
        - img "bacteria" [ref=e113]
        - img "crystal" [ref=e115]
    - button "seriski broj" [ref=e116]:
      - figure [ref=e117]: "#"
  - generic [ref=e118]:
    - img "leaf" [ref=e121]
    - generic [ref=e122]:
      - generic [ref=e123]:
        - img "logo" [ref=e125]
        - generic [ref=e126]: Biosfera
      - link "Dokumentacija" [ref=e128] [cursor=pointer]:
        - /url: https://biosfera-files.s3.eu-north-1.amazonaws.com/Biosfera+-+Nova+tehni%C4%8Dka+dokumentacija.pdf
  - generic [ref=e130]:
    - generic [ref=e131]:
      - generic [ref=e132]:
        - img "placeholder" [ref=e134]
        - generic [ref=e135]:
          - paragraph [ref=e136]: Test Korisnik
          - paragraph [ref=e137]: Grad Zagreb
      - generic [ref=e138]:
        - link [ref=e139] [cursor=pointer]:
          - /url: /user/d4eebd4c-80b0-4497-871d-a0b6a4978ba2
          - button [ref=e140]:
            - img "icon" [ref=e141]
        - link [ref=e142] [cursor=pointer]:
          - /url: /discover
          - button [ref=e143]:
            - img "icon" [ref=e144]
        - button [ref=e145]:
          - img "icon" [ref=e146]
    - generic [ref=e147]:
      - link [ref=e148] [cursor=pointer]:
        - /url: /search?name=
        - img "Pretraži..." [ref=e149]
      - textbox "Pretraži..." [ref=e150]
      - button [ref=e152]:
        - img "microphone" [ref=e154]
  - alert [ref=e155]
```

# Test source

```ts
  1   | import { join } from "node:path";
  2   | import type { Page } from "@playwright/test";
  3   | import {
  4   |   createExponat,
  5   |   createOrganisation,
  6   |   createUser,
  7   |   prisma,
  8   | } from "../support/db";
  9   | import { expect, loginAs, test } from "../support/fixtures";
  10  | 
  11  | const IMAGE = join(__dirname, "../support/files/logo.png");
  12  | 
  13  | /** Fills in the "add exponat" form for a mineral (no taxonomy lookup needed). */
  14  | const fillExponatForm = async (page: Page, name: string) => {
  15  |   await page.getByPlaceholder("Ime", { exact: true }).fill(name);
  16  |   await page.getByRole("combobox").first().selectOption("MINERAL");
  17  |   await page.getByPlaceholder("Nomenklatura").fill("SiO2 kvarc");
  18  |   await page.getByPlaceholder("Description").fill("Tvrdi mineral koji se nalazi u stijenama");
  19  | 
  20  |   // fun facts
  21  |   await page.getByPlaceholder("Upišite vrijednost").fill("Tvrdoća 7 po Mohsu");
  22  |   await page.getByTitle("add").first().click();
  23  | 
  24  |   // attributes
  25  |   await page.getByPlaceholder("Atribut", { exact: true }).fill("boja");
  26  |   await page.getByPlaceholder("Vrijednost", { exact: true }).fill("bezbojan");
  27  |   await page.getByTitle("add").last().click();
  28  | 
  29  |   await page.locator('input[type="file"]').first().setInputFiles(IMAGE);
  30  | };
  31  | 
  32  | /** Opens the authorship dialog, fills it in and submits it. */
  33  | const addAuthorship = async (page: Page) => {
  34  |   await page.getByRole("button", { name: "Dodavanje autorskih informacija" }).click();
  35  |   const dialog = page.locator("#portal");
  36  |   await dialog.getByPlaceholder("Mjesto pronalaska").fill("Papuk");
  37  |   await dialog.locator('input[type="date"]').fill("2024-05-01");
  38  |   await dialog.getByPlaceholder("Autor").fill("Ana Anić");
  39  |   await dialog.getByPlaceholder("Identifikovao").fill("Dr. Horvat");
  40  |   await dialog.getByPlaceholder("Fotograf").fill("Ivo Ivić");
  41  |   await dialog.getByPlaceholder("Naziv uređaja").fill("Canon EOS");
  42  |   await dialog.getByPlaceholder("Upišite vrijednost").fill("Hrvatski minerali, 2020.");
  43  |   await dialog.getByTitle("add").click();
  44  |   await dialog.getByRole("button", { name: "Submit" }).click();
  45  |   await expect(dialog.getByText("Dodaj informacije o autorstvu slike")).toBeHidden();
  46  | };
  47  | 
  48  | test.describe("adding an exponat", () => {
  49  |   test("an organisation admin publishes a mineral that is visible straight away", async ({ page }) => {
  50  |     const admin = await createUser();
  51  |     const org = await createOrganisation({ name: "Muzej minerala" }, [
  52  |       { userId: admin.id, role: "ADMIN" },
  53  |     ]);
  54  |     await loginAs(page, admin);
  55  | 
  56  |     await page.goto(`/organisation/${org.id}/createExponat`);
  57  |     await fillExponatForm(page, "Planinski kristal");
  58  |     await addAuthorship(page);
  59  |     await page.getByRole("button", { name: "Pošalji" }).click();
  60  | 
  61  |     // the form sends the visitor back to the organisation after saving
  62  |     await page.waitForURL(`**/organisation/${org.id}`, { timeout: 15_000 });
  63  | 
  64  |     const exponat = await prisma.exponat.findFirstOrThrow();
  65  |     expect(exponat).toMatchObject({
  66  |       name: "Planinski kristal",
  67  |       alternateName: "SiO2 kvarc",
  68  |       ExponatKind: "MINERAL",
  69  |       organisationId: org.id,
  70  |       isApproved: true,
  71  |       funFacts: ["Tvrdoća 7 po Mohsu"],
  72  |     });
  73  |     expect(JSON.parse(exponat.attributes as string)).toEqual({ boja: "bezbojan" });
  74  |     expect(exponat.mainImage).toMatch(/\/blobs\/file\/exponat\//);
  75  |     expect(exponat.authorshipInfoId).toBeTruthy();
  76  | 
  77  |     await page.goto(`/exponat/${exponat.id}`);
  78  |     await expect(page.getByText("Planinski kristal").first()).toBeVisible();
  79  |     await expect(page.getByText("bezbojan")).toBeVisible();
  80  |   });
  81  | 
  82  |   // BUG: the authorship dialog names its location field "locationOfOccurence"
  83  |   // (one r) and the API/DTO expects "locationOfOccurrence", and the date picker
  84  |   // value has no matching validator on the API, so neither is stored.
  85  |   test.fail("the authorship dialog saves the place and the date", async ({ page }) => {
  86  |     const admin = await createUser();
  87  |     const org = await createOrganisation({}, [{ userId: admin.id, role: "ADMIN" }]);
  88  |     await loginAs(page, admin);
  89  |     await page.goto(`/organisation/${org.id}/createExponat`);
  90  |     await addAuthorship(page);
  91  | 
  92  |     const info = await prisma.authorshipInfo.findFirstOrThrow();
  93  |     expect(info.photographer).toBe("Ivo Ivić");
> 94  |     expect(info.locationOfOccurence).toBe("Papuk");
      |                                      ^ Error: expect(received).toBe(expected) // Object.is equality
  95  |     expect(info.dateOfOccurence).not.toBeNull();
  96  |   });
  97  | 
  98  |   test("an incomplete form shows what is missing and saves nothing", async ({ page }) => {
  99  |     const admin = await createUser();
  100 |     const org = await createOrganisation({}, [{ userId: admin.id, role: "ADMIN" }]);
  101 |     await loginAs(page, admin);
  102 |     await page.goto(`/organisation/${org.id}/createExponat`);
  103 |     await page.getByRole("button", { name: "Pošalji" }).click();
  104 |     await expect(page.getByText(/Ime mora imati više od 5 slova/)).toBeVisible();
  105 |     expect(await prisma.exponat.count()).toBe(0);
  106 |   });
  107 | 
  108 |   test("a plain member's exponat waits for approval and the admins are notified", async ({
  109 |     page,
  110 |     browser,
  111 |   }) => {
  112 |     const admin = await createUser();
  113 |     const member = await createUser();
  114 |     const org = await createOrganisation({ name: "Geološki muzej" }, [
  115 |       { userId: admin.id, role: "ADMIN" },
  116 |       { userId: member.id, role: "MEMBER" },
  117 |     ]);
  118 | 
  119 |     await loginAs(page, member);
  120 |     await page.goto(`/organisation/${org.id}/createExponat`);
  121 |     await fillExponatForm(page, "Pirit zlato");
  122 |     await addAuthorship(page);
  123 |     await page.getByRole("button", { name: "Pošalji" }).click();
  124 |     await page.waitForURL(`**/organisation/${org.id}`, { timeout: 15_000 });
  125 | 
  126 |     const exponat = await prisma.exponat.findFirstOrThrow();
  127 |     expect(exponat.isApproved).toBe(false);
  128 | 
  129 |     // visitors do not see it
  130 |     await page.goto("/discover?kind=exponat");
  131 |     await expect(page.getByText("Pirit zlato")).toHaveCount(0);
  132 | 
  133 |     // the admin sees a notification and can publish the exponat
  134 |     const adminPage = await browser.newPage();
  135 |     await loginAs(adminPage, admin);
  136 |     await adminPage.goto(`/organisation/${org.id}`);
  137 |     await expect(adminPage.locator('button[title="notifications"]')).toContainText("1");
  138 |     await adminPage.getByRole("button", { name: "Eksponati" }).click();
  139 |     await adminPage.getByRole("button", { name: "MINERAL" }).click();
  140 |     const card = adminPage.locator('[class*="ExponatCard_container"]', { hasText: "Pirit zlato" });
  141 |     await card.getByTitle("Toggle Approval").click();
  142 |     await expect
  143 |       .poll(async () => (await prisma.exponat.findUniqueOrThrow({ where: { id: exponat.id } })).isApproved)
  144 |       .toBe(true);
  145 |     await adminPage.close();
  146 | 
  147 |     await page.goto("/discover?kind=exponat");
  148 |     await expect(page.getByRole("link", { name: "Pirit zlato" })).toBeVisible();
  149 |   });
  150 | });
  151 | 
  152 | test.describe("managing exponats", () => {
  153 |   test("an admin hides an approved exponat from the public and can remove it", async ({ page, browser }) => {
  154 |     const admin = await createUser();
  155 |     const org = await createOrganisation({}, [{ userId: admin.id, role: "ADMIN" }]);
  156 |     const exponat = await createExponat(org.id, { name: "Halit" });
  157 |     await loginAs(page, admin);
  158 |     page.on("dialog", (dialog) => dialog.accept());
  159 | 
  160 |     await page.goto(`/organisation/${org.id}`);
  161 |     await page.getByRole("button", { name: "Eksponati" }).click();
  162 |     await page.getByRole("button", { name: "MINERAL" }).click();
  163 |     const card = page.locator('[class*="ExponatCard_container"]', { hasText: "Halit" });
  164 |     await card.getByTitle("Toggle Approval").click();
  165 |     await expect
  166 |       .poll(async () => (await prisma.exponat.findUniqueOrThrow({ where: { id: exponat.id } })).isApproved)
  167 |       .toBe(false);
  168 | 
  169 |     const visitor = await browser.newPage();
  170 |     await visitor.goto("/discover?kind=exponat");
  171 |     await expect(visitor.getByText("Halit")).toHaveCount(0);
  172 |     await visitor.close();
  173 | 
  174 |     await card.getByTitle("Delete Exponat").click();
  175 |     await expect.poll(() => prisma.exponat.count()).toBe(0);
  176 |   });
  177 | 
  178 |   test("a plain member sees no moderation controls", async ({ page }) => {
  179 |     const member = await createUser();
  180 |     const org = await createOrganisation({}, [{ userId: member.id, role: "MEMBER" }]);
  181 |     await createExponat(org.id, { name: "Gips" });
  182 |     await loginAs(page, member);
  183 |     await page.goto(`/organisation/${org.id}`);
  184 |     await page.getByRole("button", { name: "Eksponati" }).click();
  185 |     await page.getByRole("button", { name: "MINERAL" }).click();
  186 |     await expect(page.getByText("Gips").first()).toBeVisible();
  187 |     await expect(page.getByTitle("Toggle Approval")).toHaveCount(0);
  188 |     await expect(page.getByTitle("Delete Exponat")).toHaveCount(0);
  189 |   });
  190 | });
  191 | 
```