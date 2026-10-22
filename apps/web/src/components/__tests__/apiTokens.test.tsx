import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithClient } from "test-utils/render";
import { setUserContext } from "test-utils/userContext";

jest.mock("components/SpeechToText", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("@/utility/context/UserContext", () => ({
  __esModule: true,
  default: () => require("test-utils/userContext").mockUserContext,
}));

const hooks = {
  list: { data: [] as any[], isLoading: false, isError: false },
  usage: { data: [] as any[], isLoading: false, isError: false },
  create: { mutateAsync: jest.fn(), isLoading: false },
  revoke: { mutate: jest.fn(), isLoading: false },
  revokeAll: { mutate: jest.fn(), mutateAsync: jest.fn(), isLoading: false },
  resetPassword: { mutateAsync: jest.fn() },
  afterPasswordReset: jest.fn(),
};
jest.mock("@/api/useGetApiTokens", () => ({
  useGetApiTokens: () => hooks.list,
}));
jest.mock("@/api/useGetApiTokenUsage", () => ({
  useGetApiTokenUsage: () => hooks.usage,
}));
jest.mock("@/api/useCreateApiToken", () => ({
  useCreateApiToken: () => hooks.create,
}));
jest.mock("@/api/useRevokeApiToken", () => ({
  useRevokeApiToken: () => hooks.revoke,
}));
jest.mock("@/api/useRevokeAllApiTokens", () => ({
  useRevokeAllApiTokens: () => hooks.revokeAll,
}));
jest.mock("@/api/useResetPassword", () => ({
  useResetPassword: () => hooks.resetPassword,
  afterPasswordReset: (loggedIn: boolean) => hooks.afterPasswordReset(loggedIn),
}));

// For UserPageBody, which renders the section through its index.
jest.mock("components/ApiTokensSection", () => ({
  __esModule: true,
  default: require("test-utils/stubs").stub("api-tokens"),
}));
jest.mock("components/EditUserForm", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("components/DeleteUserButton", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("@/utility/wrappers/userWrapper", () => ({
  UserWrapper: ({ children }: any) => children,
}));

import { ApiTokensSection } from "../ApiTokensSection/ApiTokensSection";
import { UserPageBody } from "../UserPageBody/UserPageBody";
import { RevokeApiTokensPrompt } from "../RevokeApiTokensPrompt/RevokeApiTokensPrompt";
import { ResetPaswordForm } from "../ResetPasswordForm/ResetPasswordForm";

const DAY = 24 * 60 * 60 * 1000;
const token = (over: Record<string, unknown> = {}) => ({
  id: "t1",
  name: "MCP",
  prefix: "abcd1234",
  scopes: ["READ"],
  createdAt: new Date(Date.now() - DAY).toISOString(),
  expiresAt: new Date(Date.now() + 90 * DAY).toISOString(),
  lastUsedAt: null,
  revokedAt: null,
  ...over,
});

beforeEach(() => {
  hooks.list = { data: [], isLoading: false, isError: false };
  hooks.usage = { data: [], isLoading: false, isError: false };
  hooks.create.isLoading = false;
  hooks.create.mutateAsync.mockResolvedValue({
    ...token(),
    token: "bsf_abcd1234SECRETPART",
  });
  hooks.revokeAll.mutateAsync.mockResolvedValue({ revoked: 1 });
  jest.spyOn(window, "confirm").mockReturnValue(true);
});

describe("ApiTokensSection", () => {
  const row = (name: string) =>
    screen.getByText(name).closest("li") as HTMLElement;

  it("lists the tokens with prefix, access, use and expiry", () => {
    hooks.list.data = [
      token(),
      token({
        id: "t2",
        name: "Backup",
        scopes: ["READ", "WRITE"],
        expiresAt: null,
        lastUsedAt: new Date().toISOString(),
      }),
      token({ id: "t3", name: "Old", revokedAt: new Date().toISOString() }),
    ];
    renderWithClient(<ApiTokensSection />);

    const first = within(row("MCP"));
    expect(first.getByText("bsf_abcd1234…")).toBeInTheDocument();
    expect(first.getByText("Samo čitanje")).toBeInTheDocument();
    expect(first.getByText("Nikad korišten")).toBeInTheDocument();
    expect(first.getByText(/^Istječe /)).toBeInTheDocument();

    const second = within(row("Backup"));
    expect(second.getByText("Čitanje i pisanje")).toBeInTheDocument();
    expect(second.getByText("Nikad ne istječe")).toBeInTheDocument();
    expect(second.getByText(/^Zadnje korišten /)).toBeInTheDocument();

    const revoked = within(row("Old"));
    expect(revoked.getByText(/^Opozvan /)).toBeInTheDocument();
    expect(
      revoked.queryByRole("button", { name: "Opozovi" }),
    ).not.toBeInTheDocument();
  });

  it("shows an empty state", () => {
    renderWithClient(<ApiTokensSection />);
    expect(screen.getByText("Još nemate API tokena.")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Opozovi sve tokene" }),
    ).not.toBeInTheDocument();
  });

  it("revokes a token after confirmation", async () => {
    hooks.list.data = [token()];
    renderWithClient(<ApiTokensSection />);

    (window.confirm as jest.Mock).mockReturnValueOnce(false);
    await userEvent.click(screen.getByRole("button", { name: "Opozovi" }));
    expect(hooks.revoke.mutate).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Opozovi" }));
    expect(hooks.revoke.mutate).toHaveBeenCalledWith("t1");
  });

  it("revokes all active tokens after confirmation", async () => {
    hooks.list.data = [token(), token({ id: "t2", name: "Other" })];
    renderWithClient(<ApiTokensSection />);
    await userEvent.click(
      screen.getByRole("button", { name: "Opozovi sve tokene" }),
    );
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining("2 aktivna tokena"),
    );
    expect(hooks.revokeAll.mutate).toHaveBeenCalled();
  });

  it("shows the requests of the last 30 days", async () => {
    hooks.list.data = [token()];
    hooks.usage.data = [
      { day: new Date().toISOString().slice(0, 10), requests: 7 },
    ];
    renderWithClient(<ApiTokensSection />);
    await userEvent.click(screen.getByRole("button", { name: "Korištenje" }));
    expect(
      screen.getByText("7 zahtjeva u zadnjih 30 dana"),
    ).toBeInTheDocument();
  });

  describe("new token", () => {
    const open = async () => {
      renderWithClient(<ApiTokensSection />);
      await userEvent.click(screen.getByRole("button", { name: "Novi token" }));
    };
    const create = () =>
      userEvent.click(screen.getByRole("button", { name: "Napravi token" }));

    it("needs a name", async () => {
      await open();
      await create();
      expect(screen.getByText("Dajte tokenu naziv")).toBeInTheDocument();
      expect(hooks.create.mutateAsync).not.toHaveBeenCalled();
    });

    it("is read-only and expires in 90 days by default", async () => {
      await open();
      await userEvent.type(
        screen.getByPlaceholderText("npr. MCP na mom laptopu"),
        "  MCP  ",
      );
      await create();
      expect(hooks.create.mutateAsync).toHaveBeenCalledWith({
        name: "MCP",
        scopes: ["READ"],
        expiresInDays: 90,
      });
    });

    it("takes a custom number of days", async () => {
      await open();
      await userEvent.type(
        screen.getByPlaceholderText("npr. MCP na mom laptopu"),
        "MCP",
      );
      await userEvent.selectOptions(screen.getByRole("combobox"), "custom");
      const days = screen.getByRole("spinbutton");

      await userEvent.type(days, "400");
      await create();
      expect(
        screen.getByText("Upišite cijeli broj dana od 1 do 365"),
      ).toBeInTheDocument();
      expect(hooks.create.mutateAsync).not.toHaveBeenCalled();

      await userEvent.clear(days);
      await userEvent.type(days, "14");
      await create();
      expect(hooks.create.mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ expiresInDays: 14 }),
      );
    });

    it("warns loudly about a token that never expires", async () => {
      await open();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      await userEvent.type(
        screen.getByPlaceholderText("npr. MCP na mom laptopu"),
        "Forever",
      );
      await userEvent.click(screen.getByLabelText("Čitanje i pisanje"));
      await userEvent.selectOptions(screen.getByRole("combobox"), "never");

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Ovaj token nikad neće isteći",
      );
      await create();
      expect(hooks.create.mutateAsync).toHaveBeenCalledWith({
        name: "Forever",
        scopes: ["READ", "WRITE"],
        expiresInDays: null,
      });
    });

    it("shows the new token once, with a copy button", async () => {
      const writeText = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });
      await open();
      await userEvent.type(
        screen.getByPlaceholderText("npr. MCP na mom laptopu"),
        "MCP",
      );
      await create();

      expect(await screen.findByTestId("new-api-token")).toHaveTextContent(
        "bsf_abcd1234SECRETPART",
      );
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Više se neće prikazati",
      );
      await userEvent.click(screen.getByRole("button", { name: "Kopiraj" }));
      expect(writeText).toHaveBeenCalledWith("bsf_abcd1234SECRETPART");
      expect(screen.getByRole("button", { name: "Kopirano" })).toBeEnabled();

      await userEvent.click(screen.getByRole("button", { name: "Gotovo" }));
      expect(
        screen.queryByText("bsf_abcd1234SECRETPART"),
      ).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "Novi token" }));
      expect(screen.queryByTestId("new-api-token")).not.toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("npr. MCP na mom laptopu"),
      ).toHaveValue("");
    });

    it("stays on the form when creating fails", async () => {
      hooks.create.mutateAsync.mockRejectedValue("Boom");
      await open();
      await userEvent.type(
        screen.getByPlaceholderText("npr. MCP na mom laptopu"),
        "MCP",
      );
      await create();
      expect(screen.queryByTestId("new-api-token")).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Napravi token" }),
      ).toBeInTheDocument();
    });
  });
});

describe("RevokeApiTokensPrompt", () => {
  it("revokes all tokens, then moves on", async () => {
    const onDone = jest.fn();
    renderWithClient(<RevokeApiTokensPrompt count={3} onDone={onDone} />);
    expect(screen.getByText(/Imate 3 aktivna API tokena/)).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Opozovi sve tokene" }),
    );
    expect(hooks.revokeAll.mutateAsync).toHaveBeenCalled();
    await waitFor(() => expect(onDone).toHaveBeenCalled());
  });

  it("can keep the tokens", async () => {
    const onDone = jest.fn();
    renderWithClient(<RevokeApiTokensPrompt count={1} onDone={onDone} />);
    await userEvent.click(screen.getByRole("button", { name: "Zadrži ih" }));
    expect(onDone).toHaveBeenCalled();
    expect(hooks.revokeAll.mutateAsync).not.toHaveBeenCalled();
  });
});

describe("ResetPaswordForm and API tokens", () => {
  const STRONG = "Str0ng!Pass";
  const submit = async () => {
    renderWithClient(<ResetPaswordForm code="code" />);
    await userEvent.type(screen.getByPlaceholderText("Nova lozinka"), STRONG);
    await userEvent.type(
      screen.getByPlaceholderText("Potvrdi lozinku"),
      STRONG,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Resetiraj lozinku" }),
    );
  };

  it("asks whether to revoke the tokens the reset kept", async () => {
    hooks.resetPassword.mutateAsync.mockResolvedValue({
      access_token: "jwt",
      activeApiTokens: 2,
    });
    await submit();
    expect(
      await screen.findByText("Opozvati vaše API tokene?"),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Opozovi sve tokene" }),
    );
    await waitFor(() =>
      expect(hooks.afterPasswordReset).toHaveBeenCalledWith(true),
    );
    expect(hooks.revokeAll.mutateAsync).toHaveBeenCalled();
  });

  it("asks nothing without tokens", async () => {
    hooks.resetPassword.mutateAsync.mockResolvedValue({
      access_token: "jwt",
      activeApiTokens: 0,
    });
    await submit();
    await waitFor(() =>
      expect(hooks.resetPassword.mutateAsync).toHaveBeenCalled(),
    );
    expect(
      screen.queryByText("Opozvati vaše API tokene?"),
    ).not.toBeInTheDocument();
  });
});

describe("UserPageBody", () => {
  const render = (loggedUser: Record<string, unknown>) => {
    setUserContext({ user: loggedUser });
    renderWithClient(
      <UserPageBody user={{ id: "u1", posts: [], works: [] } as any} />,
    );
  };

  it("shows the API tokens to the profile's owner", async () => {
    render({ id: "u1", role: "USER" });
    expect(await screen.findByTestId("api-tokens")).toBeInTheDocument();
  });

  it("does not show them to a super user editing someone else", async () => {
    render({ id: "admin", role: "SUPER" });
    await screen.findByText("Uredi profil");
    expect(screen.queryByTestId("api-tokens")).not.toBeInTheDocument();
  });
});
