import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithClient } from "test-utils/render";

// The microphone button needs browser APIs; the forms do not depend on it.
jest.mock("components/SpeechToText", () => ({
  __esModule: true,
  default: () => null,
}));

const hooks = {
  login: { mutateAsync: jest.fn(), isLoading: false },
  register: { mutateAsync: jest.fn(), isSuccess: false, isLoading: false },
  resetPassword: { mutateAsync: jest.fn() },
  sendReset: { mutateAsync: jest.fn() },
};
jest.mock("@/api/useLogin", () => ({ useLogin: () => hooks.login }));
jest.mock("@/api/useRegister", () => ({ useRegister: () => hooks.register }));
jest.mock("@/api/useResetPassword", () => ({
  useResetPassword: () => hooks.resetPassword,
}));
jest.mock("@/api/useSendPasswordResetEmail", () => ({
  useSendPasswordResetEmail: () => hooks.sendReset,
}));

import { RegisterForm } from "../RegisterForm/RegisterForm";
import { ResetPaswordForm } from "../ResetPasswordForm/ResetPasswordForm";
import { SignInForm } from "../SignInForm/SignInForm";

const STRONG = "Str0ng!Pass";

beforeEach(() => {
  hooks.login = {
    mutateAsync: jest.fn().mockResolvedValue({}),
    isLoading: false,
  };
  hooks.register = {
    mutateAsync: jest.fn().mockResolvedValue({}),
    isSuccess: false,
    isLoading: false,
  };
  hooks.resetPassword.mutateAsync.mockResolvedValue({});
  hooks.sendReset.mutateAsync.mockResolvedValue({});
});

describe("SignInForm", () => {
  const fill = async (email: string, password: string) => {
    await userEvent.type(screen.getByPlaceholderText("Adresa e-pošte"), email);
    await userEvent.type(screen.getByPlaceholderText("Lozinka"), password);
    await userEvent.click(screen.getByRole("button", { name: "Prijavite se" }));
  };

  it("submits valid credentials", async () => {
    renderWithClient(<SignInForm />);
    await fill("ana@test.hr", "secret1");
    await waitFor(() =>
      expect(hooks.login.mutateAsync).toHaveBeenCalledWith({
        email: "ana@test.hr",
        password: "secret1",
      }),
    );
  });

  it.each([
    ["an invalid email", "not-an-email", "secret1"],
    ["a too short password", "ana@test.hr", "short"],
  ])("does not submit %s", async (_n, email, password) => {
    renderWithClient(<SignInForm />);
    await fill(email, password);
    await new Promise((r) => setTimeout(r, 20));
    expect(hooks.login.mutateAsync).not.toHaveBeenCalled();
  });

  it("masks the password and disables it while logging in", () => {
    hooks.login.isLoading = true;
    renderWithClient(<SignInForm />);
    const password = screen.getByPlaceholderText("Lozinka");
    expect(password).toHaveAttribute("type", "password");
    expect(password).toBeDisabled();
  });

  it("links to the registration page", () => {
    renderWithClient(<SignInForm />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/register");
  });

  describe("password recovery", () => {
    it("opens a dialog and sends the reset e-mail with the address encoded", async () => {
      renderWithClient(<SignInForm />);
      expect(screen.queryByText("Oporavak lozinke")).toBeNull();

      await userEvent.click(screen.getByText("Zaboravili ste lozinku?"));
      expect(screen.getByText("Oporavak lozinke")).toBeInTheDocument();

      await userEvent.type(
        screen.getByPlaceholderText("Adresa e-pošte za oporavak"),
        "ana@test.hr",
      );
      await userEvent.click(
        screen.getByRole("button", {
          name: "Pošalji e-poštu za oporavak lozinke",
        }),
      );
      expect(hooks.sendReset.mutateAsync).toHaveBeenCalledWith("ana%40test.hr");
      await waitFor(() =>
        expect(screen.queryByText("Oporavak lozinke")).toBeNull(),
      );
    });

    it("can be closed without sending", async () => {
      renderWithClient(<SignInForm />);
      await userEvent.click(screen.getByText("Zaboravili ste lozinku?"));
      await userEvent.click(screen.getByRole("button", { name: "Zatvori" }));
      expect(screen.queryByText("Oporavak lozinke")).toBeNull();
      expect(hooks.sendReset.mutateAsync).not.toHaveBeenCalled();
    });
  });
});

describe("RegisterForm", () => {
  const values = {
    firstName: "Ana",
    lastName: "Anić",
    username: "ana",
    email: "ana@test.hr",
    password: STRONG,
    passwordConfirmation: STRONG,
  };

  const fill = async (over: Partial<typeof values> = {}) => {
    const v = { ...values, ...over };
    await userEvent.type(screen.getByPlaceholderText("Ime"), v.firstName);
    await userEvent.type(screen.getByPlaceholderText("Prezime"), v.lastName);
    await userEvent.type(
      screen.getByPlaceholderText("Korisničko ime"),
      v.username,
    );
    await userEvent.type(
      screen.getByPlaceholderText("Adresa e-pošte"),
      v.email,
    );
    await userEvent.type(screen.getByPlaceholderText("Lozinka"), v.password);
    await userEvent.type(
      screen.getByPlaceholderText("Potvrdi lozinku"),
      v.passwordConfirmation,
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "ZAGREBACKA");
    await userEvent.click(
      screen.getByRole("button", { name: "Registrirajte se" }),
    );
  };

  it("submits a valid registration", async () => {
    renderWithClient(<RegisterForm />);
    await fill();
    await waitFor(() => expect(hooks.register.mutateAsync).toHaveBeenCalled());
    expect(hooks.register.mutateAsync.mock.calls[0][0]).toMatchObject({
      firstName: "Ana",
      lastName: "Anić",
      username: "ana",
      email: "ana@test.hr",
      location: "ZAGREBACKA",
      password: STRONG,
    });
  });

  it("offers every county with its Croatian name, but not the placeholder values", () => {
    renderWithClient(<RegisterForm />);
    const labels = screen.getAllByRole("option").map((o) => o.textContent);
    expect(labels).toContain("Grad Zagreb");
    expect(labels).toContain("Zagrebačka županija");
    expect(labels).toContain("Ostalo");
    expect(labels).toHaveLength(22);
  });

  it.each([
    [
      "a one letter first name",
      { firstName: "A" },
      "Ime mora imati najmanje 2 slova",
    ],
    [
      "a one letter last name",
      { lastName: "A" },
      "Prezime mora imati najmanje 2 slova",
    ],
    ["an invalid e-mail", { email: "nope" }, "Mail mora biti pravilan"],
    [
      "a weak password",
      { password: "weakpass", passwordConfirmation: "weakpass" },
      "Lozinka mora imati najmanje 8 znakova",
    ],
    [
      "mismatching passwords",
      { passwordConfirmation: "Different1!" },
      "Lozinke se ne podudaraju",
    ],
  ])("rejects %s and says why", async (_n, over, message) => {
    renderWithClient(<RegisterForm />);
    await fill(over);
    expect(await screen.findByText(new RegExp(message))).toBeInTheDocument();
    expect(hooks.register.mutateAsync).not.toHaveBeenCalled();
  });

  it.each([
    "Sh0rt!A",
    "nouppercase1!",
    "NOLOWERCASE1!",
    "NoDigits!!",
    "NoSpecial123A",
  ])("the password rule rejects %s", async (password) => {
    renderWithClient(<RegisterForm />);
    await fill({ password, passwordConfirmation: password });
    expect(await screen.findByText(/Lozinka mora imati/)).toBeInTheDocument();
  });

  it("shows the confirmation dialog once registered", () => {
    hooks.register.isSuccess = true;
    renderWithClient(<RegisterForm />);
    expect(screen.getByText("Uspjeh")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Otiđi na prijavu" }),
    ).toHaveAttribute("href", "/login");
  });

  it("disables the password fields while registering", () => {
    hooks.register.isLoading = true;
    renderWithClient(<RegisterForm />);
    expect(screen.getByPlaceholderText("Lozinka")).toBeDisabled();
    expect(screen.getByPlaceholderText("Potvrdi lozinku")).toBeDisabled();
  });
});

describe("ResetPaswordForm", () => {
  const submit = async (password: string, confirm: string) => {
    await userEvent.type(screen.getByPlaceholderText("Nova lozinka"), password);
    await userEvent.type(
      screen.getByPlaceholderText("Potvrdi lozinku"),
      confirm,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Resetiraj lozinku" }),
    );
  };

  it("sends the new password with the activation code from the link", async () => {
    renderWithClient(<ResetPaswordForm code="abc-123" />);
    await submit(STRONG, STRONG);
    await waitFor(() =>
      expect(hooks.resetPassword.mutateAsync).toHaveBeenCalledWith({
        userActivationCode: "abc-123",
        newPassword: STRONG,
      }),
    );
  });

  it("requires a strong password", async () => {
    renderWithClient(<ResetPaswordForm code="c" />);
    await submit("weak", "weak");
    expect(await screen.findByText(/Lozinka mora imati/)).toBeInTheDocument();
    expect(hooks.resetPassword.mutateAsync).not.toHaveBeenCalled();
  });

  it("requires both fields to match", async () => {
    renderWithClient(<ResetPaswordForm code="c" />);
    await submit(STRONG, "Other1!Pass");
    expect(
      await screen.findByText("Lozinke se ne podudaraju"),
    ).toBeInTheDocument();
    expect(hooks.resetPassword.mutateAsync).not.toHaveBeenCalled();
  });
});
