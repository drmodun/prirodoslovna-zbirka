# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> signing in >> the menu button has an accessible name
- Location: tests/auth.spec.ts:121:8

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /menu/i })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('button', { name: /menu/i }) with timeout 10000ms
  - waiting for getByRole('button', { name: /menu/i })

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
- heading "Nema rezultata" [level=1]
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
  23  |     await page.getByRole("combobox").selectOption("ZAGREBACKA");
  24  |     await page.getByRole("button", { name: "Registrirajte se" }).click();
  25  | 
  26  |     // the dialog points to the login page
  27  |     await expect(page.getByText("Uspješno napravljen korisnik")).toBeVisible();
  28  | 
  29  |     // the account exists but cannot be used before it is activated
  30  |     const created = await prisma.user.findUniqueOrThrow({ where: { email: NEW_USER.email } });
  31  |     expect(created).toMatchObject({ isActivated: false, role: "USER", location: "ZAGREBACKA" });
  32  |     expect(created.password).not.toBe(PASSWORD);
  33  | 
  34  |     // the link from the activation e-mail
  35  |     await page.goto(`/activateUser/${created.activationCode}`);
  36  |     await expect(page.getByRole("heading", { name: /Uspješna verifikacija/ })).toBeVisible();
  37  |     expect((await prisma.user.findUniqueOrThrow({ where: { id: created.id } })).isActivated).toBe(true);
  38  | 
  39  |     await page.goto("/login");
  40  |     await page.getByPlaceholder("Adresa e-pošte").fill(NEW_USER.email);
  41  |     await page.getByPlaceholder("Lozinka").fill(PASSWORD);
  42  |     await page.getByRole("button", { name: "Prijavite se" }).click();
  43  |     await page.waitForURL("**/discover");
  44  |     expect(await page.evaluate(() => localStorage.getItem("access_token"))).toBeTruthy();
  45  |   });
  46  | 
  47  |   test("an invalid registration is stopped in the browser with a reason", async ({ page }) => {
  48  |     await page.goto("/register");
  49  |     await page.getByPlaceholder("Ime", { exact: true }).fill("A");
  50  |     await page.getByPlaceholder("Adresa e-pošte").fill("nope");
  51  |     await page.getByPlaceholder("Lozinka", { exact: true }).fill("weak");
  52  |     await page.getByRole("button", { name: "Registrirajte se" }).click();
  53  |     await expect(page.getByText("Ime mora imati najmanje 2 slova").first()).toBeVisible();
  54  |     await expect(page.getByText("Mail mora biti pravilan").first()).toBeVisible();
  55  |     await expect(page.getByText(/Lozinka mora imati najmanje 8 znakova/).first()).toBeVisible();
  56  |     expect(await prisma.user.count()).toBe(0);
  57  |   });
  58  | 
  59  |   test("an unknown activation link says so", async ({ page }) => {
  60  |     await page.goto("/activateUser/not-a-real-code");
  61  |     await expect(page.getByRole("heading", { name: "Greška pri verifikaciji" })).toBeVisible();
  62  |   });
  63  | 
  64  |   // The API requires `bio` to be a string, but the form always sends the (empty)
  65  |   // textarea value, so an optional description is not a problem for visitors.
  66  |   test("a visitor can register without filling in the optional description", async ({ page }) => {
  67  |     await page.goto("/register");
  68  |     await page.getByPlaceholder("Ime", { exact: true }).fill(NEW_USER.firstName);
  69  |     await page.getByPlaceholder("Prezime").fill(NEW_USER.lastName);
  70  |     await page.getByPlaceholder("Korisničko ime").fill(NEW_USER.username);
  71  |     await page.getByPlaceholder("Adresa e-pošte").fill(NEW_USER.email);
  72  |     await page.getByPlaceholder("Lozinka", { exact: true }).fill(PASSWORD);
  73  |     await page.getByPlaceholder("Potvrdi lozinku").fill(PASSWORD);
  74  |     await page.getByRole("combobox").selectOption("ZAGREBACKA");
  75  |     await page.getByRole("button", { name: "Registrirajte se" }).click();
  76  |     await expect(page.getByText("Uspješno napravljen korisnik")).toBeVisible();
  77  |   });
  78  | });
  79  | 
  80  | const openMenu = (page: Page) =>
  81  |   page.locator('button[class*="Hamburger_container"]').click();
  82  | 
  83  | test.describe("signing in", () => {
  84  |   test("wrong credentials show an error and keep the visitor logged out", async ({ page }) => {
  85  |     const user = await createUser();
  86  |     await page.goto("/login");
  87  |     await page.getByPlaceholder("Adresa e-pošte").fill(user.email);
  88  |     await page.getByPlaceholder("Lozinka").fill("Wrong!Passw0rd");
  89  |     await page.getByRole("button", { name: "Prijavite se" }).click();
  90  |     await expect(page.getByText("Invalid credentials")).toBeVisible();
  91  |     expect(await page.evaluate(() => localStorage.getItem("access_token"))).toBeNull();
  92  |     await expect(page).toHaveURL(/\/login$/);
  93  |   });
  94  | 
  95  |   test("an account that is not activated cannot sign in", async ({ page }) => {
  96  |     const user = await createUser({ isActivated: false });
  97  |     await page.goto("/login");
  98  |     await page.getByPlaceholder("Adresa e-pošte").fill(user.email);
  99  |     await page.getByPlaceholder("Lozinka").fill(PASSWORD);
  100 |     await page.getByRole("button", { name: "Prijavite se" }).click();
  101 |     await expect(page.getByText("User not found")).toBeVisible();
  102 |   });
  103 | 
  104 |   test("a signed in user sees their name in the menu and can sign out", async ({ page }) => {
  105 |     const user = await createUser({ firstName: "Ivo", lastName: "Ivić" });
  106 |     await loginAs(page, user);
  107 |     await page.goto("/discover");
  108 | 
  109 |     await openMenu(page);
  110 |     await expect(page.getByText("Ivo Ivić")).toBeVisible();
  111 | 
  112 |     page.once("dialog", (dialog) => dialog.accept());
  113 |     // user, discover and log out; all three icons share the alt text "icon"
  114 |     await page.locator('[class*="IconButton_iconButton"]').nth(2).click();
  115 |     await page.waitForURL((url) => url.pathname === "/");
  116 |     expect(await page.evaluate(() => localStorage.getItem("access_token"))).toBeNull();
  117 |   });
  118 | 
  119 |   // BUG: the menu button's accessible name is set through a misspelt attribute
  120 |   // (`awia-label`), so screen readers announce an unnamed button.
  121 |   test.fail("the menu button has an accessible name", async ({ page }) => {
  122 |     await page.goto("/discover");
> 123 |     await expect(page.getByRole("button", { name: /menu/i })).toBeVisible();
      |                                                               ^ Error: expect(locator).toBeVisible() failed
  124 |   });
  125 | 
  126 |   test("a visitor who is not signed in is told to sign in before creating an organisation", async ({
  127 |     page,
  128 |   }) => {
  129 |     const dialog = page.waitForEvent("dialog");
  130 |     await page.goto("/createOrganisation");
  131 |     expect((await dialog).message()).toContain("prijavljeni");
  132 |     await (await dialog).dismiss();
  133 |   });
  134 | });
  135 | 
  136 | test.describe("password reset", () => {
  137 |   test("the link from the reset e-mail lets the user choose a new password", async ({ page }) => {
  138 |     const user = await createUser();
  139 |     const NEW_PASSWORD = "N3w!Passw0rd-xyz";
  140 | 
  141 |     await page.goto(`/resetPassword/${user.activationCode}`);
  142 |     await page.getByPlaceholder("Nova lozinka").fill(NEW_PASSWORD);
  143 |     await page.getByPlaceholder("Potvrdi lozinku").fill(NEW_PASSWORD);
  144 |     await page.getByRole("button", { name: "Resetiraj lozinku" }).click();
  145 |     await page.waitForURL("**/login", { timeout: 15_000 });
  146 | 
  147 |     await page.getByPlaceholder("Adresa e-pošte").fill(user.email);
  148 |     await page.getByPlaceholder("Lozinka").fill(PASSWORD);
  149 |     await page.getByRole("button", { name: "Prijavite se" }).click();
  150 |     await expect(page.getByText("Invalid credentials")).toBeVisible();
  151 | 
  152 |     await page.getByPlaceholder("Lozinka").fill(NEW_PASSWORD);
  153 |     await page.getByRole("button", { name: "Prijavite se" }).click();
  154 |     await page.waitForURL("**/discover");
  155 |   });
  156 | 
  157 |   test("mismatching passwords are rejected before anything is sent", async ({ page }) => {
  158 |     const user = await createUser();
  159 |     await page.goto(`/resetPassword/${user.activationCode}`);
  160 |     await page.getByPlaceholder("Nova lozinka").fill("N3w!Passw0rd-xyz");
  161 |     await page.getByPlaceholder("Potvrdi lozinku").fill("Different1!Pass");
  162 |     await page.getByRole("button", { name: "Resetiraj lozinku" }).click();
  163 |     await expect(page.getByText("Lozinke se ne poklapaju")).toBeVisible();
  164 |   });
  165 | });
  166 | 
```