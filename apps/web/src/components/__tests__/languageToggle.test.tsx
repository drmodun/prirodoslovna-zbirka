import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LanguageToggle from "components/LanguageToggle";
import { renderWithClient } from "test-utils/render";
import { mockRouter } from "test-utils/router";
import { setTestLocale } from "test-utils/intl";
import { api } from "@/api/shared";
import { QueryClient } from "react-query";

jest.mock("@/api/shared", () => ({
  api: { patch: jest.fn(() => Promise.resolve()) },
}));

const clearCookie = () => {
  document.cookie = "NEXT_LOCALE=; path=/; max-age=0";
};

describe("LanguageToggle", () => {
  beforeEach(() => {
    clearCookie();
    setTestLocale("en");
  });

  it("marks the current language as pressed", () => {
    renderWithClient(<LanguageToggle />);

    expect(screen.getByRole("button", { name: "EN" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "HR" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("stores the new language in a cookie and refreshes the page", async () => {
    renderWithClient(<LanguageToggle />);

    await userEvent.click(screen.getByRole("button", { name: "HR" }));

    expect(document.cookie).toContain("NEXT_LOCALE=hr");
    expect(mockRouter.refresh).toHaveBeenCalled();
    // Nobody is logged in, so there is no profile to save it to.
    expect(api.patch).not.toHaveBeenCalled();
  });

  it("saves the choice to a logged in user's profile", async () => {
    // Keeps the profile cached although nothing observes it.
    const client = new QueryClient();
    client.setQueryData(["me"], { id: "user-1", language: "EN" });
    const invalidate = jest.spyOn(client, "invalidateQueries");
    renderWithClient(<LanguageToggle />, { client });

    await userEvent.click(screen.getByRole("button", { name: "HR" }));

    expect(api.patch).toHaveBeenCalledWith("/users/language", {
      language: "HR",
    });
    expect(client.getQueryData(["me"])).toMatchObject({ language: "HR" });
    // the notifications come back in the new language
    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith("notifications"),
    );
  });

  it("does nothing for the language already in use", async () => {
    renderWithClient(<LanguageToggle />);

    await userEvent.click(screen.getByRole("button", { name: "EN" }));

    expect(mockRouter.refresh).not.toHaveBeenCalled();
    expect(document.cookie).not.toContain("NEXT_LOCALE");
  });
});
