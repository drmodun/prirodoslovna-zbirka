# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: engagement.spec.ts >> writing a post >> a member writes a post about an exponat
- Location: tests/engagement.spec.ts:135:8

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 1
Received: 0

Call Log:
- Timeout 10000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=e1]:
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
  - generic [ref=e17]:
    - generic [ref=e19]:
      - generic [ref=e20]: Napravite novu objavu
      - generic [ref=e21]:
        - generic [ref=e23]:
          - textbox "Naslov" [ref=e24]: Moja objava o mineralu
          - button [ref=e26]:
            - img "microphone" [ref=e28]
        - generic [ref=e30]:
          - textbox "Unesite tekst objave, markdown je podržan" [ref=e31]: Ovo je dovoljno dugačak tekst objave.
          - button [ref=e32]:
            - img "microphone" [ref=e34]
        - generic [ref=e35]:
          - generic [ref=e36]:
            - generic [ref=e37]: Naslovna slika
            - generic [ref=e38]:
              - button "Choose File" [disabled] [ref=e39]
              - img "plus" [ref=e41]
              - generic [ref=e42]: Maskimalni broj datoteka je stavljen
            - generic [ref=e44]:
              - generic [ref=e45]: logo.png
              - generic [ref=e46]:
                - generic [ref=e47]: 0.001 MB
                - button [ref=e48] [cursor=pointer]:
                  - img "remove" [ref=e49]
          - generic [ref=e50]:
            - generic [ref=e51]: Glavna slika
            - generic [ref=e52]:
              - button "Choose File" [disabled] [ref=e53]
              - img "plus" [ref=e55]
              - generic [ref=e56]: Maskimalni broj datoteka je stavljen
            - generic [ref=e58]:
              - generic [ref=e59]: logo.png
              - generic [ref=e60]:
                - generic [ref=e61]: 0.001 MB
                - button [ref=e62] [cursor=pointer]:
                  - img "remove" [ref=e63]
        - button "Dodavanje autorskih informacija" [ref=e65]
        - button "Napravi objavu" [active] [ref=e66] [cursor=pointer]
    - button "seriski broj" [ref=e67]:
      - figure [ref=e68]: "#"
  - generic [ref=e69]:
    - img "leaf" [ref=e72]
    - generic [ref=e73]:
      - generic [ref=e74]:
        - img "logo" [ref=e76]
        - generic [ref=e77]: Biosfera
      - link "Dokumentacija" [ref=e79] [cursor=pointer]:
        - /url: https://biosfera-files.s3.eu-north-1.amazonaws.com/Biosfera+-+Nova+tehni%C4%8Dka+dokumentacija.pdf
  - generic [ref=e81]:
    - generic [ref=e82]:
      - generic [ref=e83]:
        - img "placeholder" [ref=e85]
        - generic [ref=e86]:
          - paragraph [ref=e87]: Test Korisnik
          - paragraph [ref=e88]: Grad Zagreb
      - generic [ref=e89]:
        - link [ref=e90] [cursor=pointer]:
          - /url: /user/d88512af-1981-4b98-9cf5-3ddebda54601
          - button [ref=e91]:
            - img "icon" [ref=e92]
        - link [ref=e93] [cursor=pointer]:
          - /url: /discover
          - button [ref=e94]:
            - img "icon" [ref=e95]
        - button [ref=e96]:
          - img "icon" [ref=e97]
    - generic [ref=e98]:
      - link [ref=e99] [cursor=pointer]:
        - /url: /search?name=
        - img "Pretraži..." [ref=e100]
      - textbox "Pretraži..." [ref=e101]
      - button [ref=e103]:
        - img "microphone" [ref=e105]
  - alert [ref=e106]
```

# Test source

```ts
  51  |     const post = await createPost(author.id, exponat.id, { title: "Priča o kvarcu" });
  52  |     await loginAs(page, reader);
  53  | 
  54  |     await page.goto("/discover?kind=post");
  55  |     const card = page.locator('[class*="PostCard_container"]', { hasText: "Priča o kvarcu" });
  56  |     await card.getByTitle("like").click();
  57  |     await expect
  58  |       .poll(() => prisma.like.count({ where: { userId: reader.id, postId: post.id } }))
  59  |       .toBe(1);
  60  |   });
  61  | });
  62  | 
  63  | test.describe("following", () => {
  64  |   test("following a user shows up in both profiles and notifies the followed user", async ({
  65  |     page,
  66  |     browser,
  67  |   }) => {
  68  |     const ana = await createUser({ username: "ana_prati" });
  69  |     const ivo = await createUser({ username: "ivo_pracen", firstName: "Ivo" });
  70  |     await loginAs(page, ana);
  71  | 
  72  |     await page.goto(`/user/${ivo.id}`);
  73  |     await page.getByTitle("follow user").click();
  74  |     await expect(page.getByTitle("follow user")).toHaveText("Prestani pratiti");
  75  |     await expect
  76  |       .poll(() => prisma.userFollows.count({ where: { followerId: ana.id, followeeId: ivo.id } }))
  77  |       .toBe(1);
  78  | 
  79  |     // the followed user is told, and the bell shows how many are unread
  80  |     const ivoPage = await browser.newPage();
  81  |     await loginAs(ivoPage, ivo);
  82  |     await ivoPage.goto("/discover");
  83  |     await expect(ivoPage.locator('button[title="notifications"]')).toContainText("1");
  84  |     await ivoPage.locator('button[title="notifications"]').click();
  85  |     await expect(ivoPage.locator("#portal").getByText("Novi pratitelj")).toBeVisible();
  86  |     await expect(ivoPage.locator("#portal").getByText("ana_prati")).toBeVisible();
  87  | 
  88  |     await ivoPage.locator("#portal").getByRole("button", { name: "Označi sve kao pročitano" }).click();
  89  |     await expect
  90  |       .poll(() => prisma.userNotification.count({ where: { userId: ivo.id, isRead: false } }))
  91  |       .toBe(0);
  92  |     await expect(ivoPage.locator('button[title="notifications"]')).toContainText("0");
  93  |     await ivoPage.close();
  94  | 
  95  |     // the follow list page shows the relationship
  96  |     await page.goto(`/follows/${ivo.id}`);
  97  |     await expect(page.getByText("ana_prati").first()).toBeVisible();
  98  |   });
  99  | 
  100 |   test("a user can stop following", async ({ page }) => {
  101 |     const ana = await createUser();
  102 |     const ivo = await createUser();
  103 |     await prisma.userFollows.create({ data: { followerId: ana.id, followeeId: ivo.id } });
  104 |     await loginAs(page, ana);
  105 |     await page.goto(`/user/${ivo.id}`);
  106 |     await expect(page.getByTitle("follow user")).toHaveText("Prestani pratiti");
  107 |     await page.getByTitle("follow user").click();
  108 |     await expect.poll(() => prisma.userFollows.count()).toBe(0);
  109 |   });
  110 | });
  111 | 
  112 | test.describe("notifications", () => {
  113 |   test("a new notification appears in the bell without reloading the page", async ({ page, browser }) => {
  114 |     const ana = await createUser();
  115 |     const ivo = await createUser();
  116 |     await loginAs(page, ivo);
  117 |     await page.goto("/discover");
  118 |     await expect(page.locator('button[title="notifications"]')).toContainText("0");
  119 | 
  120 |     const other = await browser.newPage();
  121 |     await loginAs(other, ana);
  122 |     await other.goto(`/user/${ivo.id}`);
  123 |     await other.getByTitle("follow user").click();
  124 | 
  125 |     // pushed over the server-sent events stream
  126 |     await expect(page.locator('button[title="notifications"]')).toContainText("1", { timeout: 15_000 });
  127 |     await other.close();
  128 |   });
  129 | });
  130 | 
  131 | test.describe("writing a post", () => {
  132 |   // BUG: creating a post is broken end to end: the API answers 500 for every
  133 |   // request (its DTO's `isAdmin` leaks into the database call), and the web
  134 |   // form drops `authorshipInfoId`, which the API requires.
  135 |   test.fail("a member writes a post about an exponat", async ({ page }) => {
  136 |     const member = await createUser();
  137 |     const org = await createOrganisation({}, [{ userId: member.id, role: "MEMBER" }]);
  138 |     const exponat = await createExponat(org.id);
  139 |     await loginAs(page, member);
  140 | 
  141 |     await page.goto(`/exponat/${exponat.id}/createPost`);
  142 |     await page.getByPlaceholder("Naslov").fill("Moja objava o mineralu");
  143 |     await page
  144 |       .getByPlaceholder("Unesite tekst objave, markdown je podržan")
  145 |       .fill("Ovo je dovoljno dugačak tekst objave.");
  146 |     const files = page.locator('input[type="file"]');
  147 |     await files.nth(0).setInputFiles("support/files/logo.png");
  148 |     await files.nth(1).setInputFiles("support/files/logo.png");
  149 |     await page.getByRole("button", { name: "Napravi objavu" }).click();
  150 | 
> 151 |     await expect.poll(() => prisma.post.count(), { timeout: 10_000 }).toBe(1);
      |                                                                       ^ Error: expect(received).toBe(expected) // Object.is equality
  152 |   });
  153 | });
  154 | 
```