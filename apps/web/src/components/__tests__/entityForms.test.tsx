import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setLocation } from "test-utils/router";
import { setUserContext } from "test-utils/userContext";

jest.mock("components/SpeechToText", () => ({
  __esModule: true,
  default: () => null,
}));
// Has its own test; here it only has to show up.
jest.mock("components/LanguageToggle", () => ({
  __esModule: true,
  default: () => <div data-testid="language-toggle" />,
}));
jest.mock("@/utility/context/UserContext", () => ({
  __esModule: true,
  default: () => require("test-utils/userContext").mockUserContext,
}));

const api = {
  upload: { mutateAsync: jest.fn() },
  createOrganisation: { mutateAsync: jest.fn() },
  updateOrganisation: { mutateAsync: jest.fn() },
  editUser: { mutateAsync: jest.fn(), isLoading: false },
  uploadPicture: { mutateAsync: jest.fn(), isSuccess: false },
  adminEditUser: { mutateAsync: jest.fn() },
};
jest.mock("@/api/useUploadFile", () => ({ useUploadFile: () => api.upload }));
jest.mock("@/api/useCreateOrganisation", () => ({
  useCreateOrganisation: () => api.createOrganisation,
}));
jest.mock("@/api/useUpdateOrganisation", () => ({
  useUpdateOrganisation: () => api.updateOrganisation,
}));
jest.mock("@/api/useEditUserInfo", () => ({
  useEditUserInfo: () => api.editUser,
}));
jest.mock("@/api/useUploadProfilePicture", () => ({
  useUploadProfilePicture: () => api.uploadPicture,
}));
jest.mock("@/api/useAdminUpdateUserInfo", () => ({
  useAdminUpdateUserInfo: () => api.adminEditUser,
}));

const mockNotifications = jest.fn();
jest.mock("@/utility/context/NotificationContext", () => ({
  __esModule: true,
  default: () => mockNotifications(),
}));
const mockCreate = jest.fn();
jest.mock("@/utility/context/CreateButtonContext", () => ({
  __esModule: true,
  default: () => mockCreate(),
}));

import { CreateButton } from "../CreateButton/CreateButton";
import { OrganisationForm } from "../CreateOrganisationForm/CreateOrganisationForm";
import { EditUserForm } from "../EditUserForm/EditUserForm";
import { NotificationBell } from "../NotificationBell/NotificationBell";

const png = () =>
  new File([new Uint8Array(10)], "logo.png", { type: "image/png" });
const fileInput = (c: HTMLElement) =>
  c.querySelector('input[type="file"]') as HTMLInputElement;

beforeEach(() => {
  setUserContext({ user: { id: "u1" } });
  api.upload.mutateAsync.mockResolvedValue("http://files/org.png");
  api.createOrganisation.mutateAsync.mockResolvedValue({ id: "o-new" });
  api.updateOrganisation.mutateAsync.mockResolvedValue({ id: "o1" });
  api.editUser.mutateAsync.mockResolvedValue({});
  api.uploadPicture.mutateAsync.mockResolvedValue({});
  api.adminEditUser.mutateAsync.mockResolvedValue({});
  jest.spyOn(window, "alert").mockImplementation(() => {});
});

describe("OrganisationForm", () => {
  const fillValid = async () => {
    await userEvent.type(
      screen.getByPlaceholderText("Naziv organizacije"),
      "Prirodoslovni muzej",
    );
    await userEvent.type(
      screen.getByPlaceholderText("Opis"),
      "Muzej prirodnih znanosti",
    );
    await userEvent.type(
      screen.getByPlaceholderText("Poveznica na web stranicu"),
      "https://muzej.hr",
    );
    await userEvent.type(
      screen.getByPlaceholderText("Adresa e-pošte"),
      "info@muzej.hr",
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "ISTARSKA");
  };

  it("asks logged out visitors to sign in", () => {
    setUserContext();
    render(<OrganisationForm />);
    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining("prijavljeni"),
    );
  });

  it("creates an organisation: uploads the logo first, then submits the form with its URL", async () => {
    const { container } = render(<OrganisationForm />);
    await fillValid();
    await userEvent.upload(fileInput(container), png());
    await userEvent.click(
      screen.getByRole("button", { name: "Stvori organizaciju" }),
    );

    await waitFor(() =>
      expect(api.createOrganisation.mutateAsync).toHaveBeenCalled(),
    );
    expect(api.upload.mutateAsync).toHaveBeenCalledWith({
      file: expect.objectContaining({ name: "logo.png" }),
      directory: "organisation",
    });
    expect(api.createOrganisation.mutateAsync.mock.calls[0][0]).toMatchObject({
      name: "Prirodoslovni muzej",
      description: "Muzej prirodnih znanosti",
      websiteUrl: "https://muzej.hr",
      email: "info@muzej.hr",
      location: "ISTARSKA",
      mainImage: "http://files/org.png",
    });
    expect(api.updateOrganisation.mutateAsync).not.toHaveBeenCalled();
  });

  it.each([
    [
      "a too short name",
      "Naziv organizacije",
      "A",
      "Ime mora imati najmanje 2 slova",
    ],
    [
      "an invalid e-mail",
      "Adresa e-pošte",
      "nope",
      "Adresa e-pošte nije pravilnog formata",
    ],
    [
      "an invalid web address",
      "Poveznica na web stranicu",
      "not a url",
      "Poveznica nije pravilnog formata",
    ],
  ])("rejects %s", async (_n, placeholder, value, message) => {
    render(<OrganisationForm />);
    await fillValid();
    const field = screen.getByPlaceholderText(placeholder);
    await userEvent.clear(field);
    await userEvent.type(field, value);
    await userEvent.click(
      screen.getByRole("button", { name: "Stvori organizaciju" }),
    );
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(api.createOrganisation.mutateAsync).not.toHaveBeenCalled();
  });

  it("names the real description limit in its error message", async () => {
    render(<OrganisationForm />);
    await fillValid();
    const field = screen.getByPlaceholderText("Opis");
    await userEvent.clear(field);
    await userEvent.type(field, "x".repeat(201), { delay: null });
    await userEvent.click(
      screen.getByRole("button", { name: "Stvori organizaciju" }),
    );
    expect(await screen.findByText(/najviše 200 slova/)).toBeInTheDocument();
  });

  describe("editing", () => {
    const organisation = {
      id: "o1",
      name: "Stari naziv",
      description: "Stari opis organizacije",
      websiteUrl: "https://stari.hr",
      email: "stari@muzej.hr",
      location: "ZADARSKA",
      mainImage: "http://files/old.png",
    } as any;

    it("starts with the stored values and updates instead of creating", async () => {
      render(<OrganisationForm isEdit initvalues={organisation} />);
      expect(screen.getByPlaceholderText("Naziv organizacije")).toHaveValue(
        "Stari naziv",
      );
      await userEvent.clear(screen.getByPlaceholderText("Naziv organizacije"));
      await userEvent.type(
        screen.getByPlaceholderText("Naziv organizacije"),
        "Novi naziv",
      );
      await userEvent.click(
        screen.getByRole("button", { name: "Spremi promjene" }),
      );

      await waitFor(() =>
        expect(api.updateOrganisation.mutateAsync).toHaveBeenCalled(),
      );
      const call = api.updateOrganisation.mutateAsync.mock.calls[0][0];
      expect(call.organisationId).toBe("o1");
      expect(call.updateOrganisationDto).toMatchObject({
        name: "Novi naziv",
        mainImage: "http://files/old.png", // kept: no new image was chosen
      });
      expect(api.upload.mutateAsync).not.toHaveBeenCalled();
      expect(api.createOrganisation.mutateAsync).not.toHaveBeenCalled();
    });

    it("uploads a replacement image when one is chosen", async () => {
      const { container } = render(
        <OrganisationForm isEdit initvalues={organisation} />,
      );
      await userEvent.upload(fileInput(container), png());
      await userEvent.click(
        screen.getByRole("button", { name: "Spremi promjene" }),
      );
      await waitFor(() =>
        expect(api.updateOrganisation.mutateAsync).toHaveBeenCalled(),
      );
      expect(
        api.updateOrganisation.mutateAsync.mock.calls[0][0]
          .updateOrganisationDto.mainImage,
      ).toBe("http://files/org.png");
    });
  });
});

describe("EditUserForm", () => {
  const user = (over: Record<string, unknown> = {}) =>
    ({
      id: "u1",
      firstName: "Ana",
      lastName: "Anić",
      username: "ana",
      bio: "Biolog",
      location: "ZAGREBACKA",
      hasProfileImage: false,
      ...over,
    }) as any;

  it("starts with the profile of the user", () => {
    render(<EditUserForm user={user()} />);
    expect(screen.getByPlaceholderText("Ime")).toHaveValue("Ana");
    expect(screen.getByPlaceholderText("Prezime")).toHaveValue("Anić");
    expect(screen.getByPlaceholderText("Korisničko ime")).toHaveValue("ana");
    expect(screen.getByPlaceholderText("Opis")).toHaveValue("Biolog");
    expect(screen.getByRole("combobox")).toHaveValue("ZAGREBACKA");
  });

  it("saves the edited profile for the logged in user", async () => {
    render(<EditUserForm user={user()} />);
    await userEvent.clear(screen.getByPlaceholderText("Ime"));
    await userEvent.type(screen.getByPlaceholderText("Ime"), "Anamarija");
    await userEvent.click(
      screen.getByRole("button", { name: "Spremi promjene" }),
    );
    await waitFor(() => expect(api.editUser.mutateAsync).toHaveBeenCalled());
    expect(api.editUser.mutateAsync.mock.calls[0][0]).toMatchObject({
      firstName: "Anamarija",
      lastName: "Anić",
      location: "ZAGREBACKA",
    });
    expect(api.adminEditUser.mutateAsync).not.toHaveBeenCalled();
  });

  it("super users edit someone else's profile through the admin endpoint, without a picture field", async () => {
    const { container } = render(
      <EditUserForm user={user({ id: "u9" })} isSuper />,
    );
    expect(fileInput(container)).toBeNull();
    await userEvent.click(
      screen.getByRole("button", { name: "Spremi promjene" }),
    );
    await waitFor(() =>
      expect(api.adminEditUser.mutateAsync).toHaveBeenCalled(),
    );
    expect(api.adminEditUser.mutateAsync.mock.calls[0][0].userId).toBe("u9");
    expect(api.editUser.mutateAsync).not.toHaveBeenCalled();
  });

  it.each([
    ["first name", "Ime", "A", "Ime mora imati najmanje 2 slova"],
    ["last name", "Prezime", "A", "Prezime mora imati najmanje 2 slova"],
  ])("validates the %s", async (_n, placeholder, value, message) => {
    render(<EditUserForm user={user()} />);
    await userEvent.clear(screen.getByPlaceholderText(placeholder));
    await userEvent.type(screen.getByPlaceholderText(placeholder), value);
    await userEvent.click(
      screen.getByRole("button", { name: "Spremi promjene" }),
    );
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(api.editUser.mutateAsync).not.toHaveBeenCalled();
  });

  it("uploads a new profile picture before saving", async () => {
    const { container } = render(<EditUserForm user={user()} />);
    await userEvent.upload(fileInput(container), png());
    await userEvent.click(
      screen.getByRole("button", { name: "Spremi promjene" }),
    );
    await waitFor(() => expect(api.editUser.mutateAsync).toHaveBeenCalled());
    expect(api.uploadPicture.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ name: "logo.png" }),
    );
    expect(api.editUser.mutateAsync.mock.calls[0][0].hasProfileImage).toBe(
      true,
    );
  });

  it("users with a picture can remove it", async () => {
    const { container } = render(
      <EditUserForm user={user({ hasProfileImage: true })} />,
    );
    expect(fileInput(container)).toBeNull();
    await userEvent.click(
      screen.getByRole("button", { name: "Uklonite profilnu sliku" }),
    );
    expect(fileInput(container)).not.toBeNull(); // the upload field comes back
    await userEvent.click(
      screen.getByRole("button", { name: "Spremi promjene" }),
    );
    await waitFor(() => expect(api.editUser.mutateAsync).toHaveBeenCalled());
    expect(api.editUser.mutateAsync.mock.calls[0][0].hasProfileImage).toBe(
      false,
    );
  });

  it("keeps the profile picture when only other fields are edited", async () => {
    render(<EditUserForm user={user({ hasProfileImage: true })} />);
    await userEvent.clear(screen.getByPlaceholderText("Opis"));
    await userEvent.type(screen.getByPlaceholderText("Opis"), "Novi opis");
    await userEvent.click(
      screen.getByRole("button", { name: "Spremi promjene" }),
    );
    await waitFor(() => expect(api.editUser.mutateAsync).toHaveBeenCalled());
    expect(api.editUser.mutateAsync.mock.calls[0][0].hasProfileImage).toBe(
      true,
    );
  });

  it("offers the language switch on the user's own profile only", () => {
    const { unmount } = render(<EditUserForm user={user()} />);
    expect(screen.getByTestId("language-toggle")).toBeInTheDocument();
    expect(screen.getByText("Jezik sučelja")).toBeInTheDocument();
    unmount();

    render(<EditUserForm user={user({ id: "someone-else" })} isSuper />);
    expect(screen.queryByTestId("language-toggle")).toBeNull();
  });
});

describe("NotificationBell", () => {
  const mocks = { notifications: [] as any[], showModal: jest.fn() };
  beforeEach(() => {
    mocks.notifications = [];
    mocks.showModal = jest.fn();
  });

  const mount = () => {
    mockNotifications.mockReturnValue(mocks);
    return render(<NotificationBell />);
  };

  it("is hidden for logged out visitors", () => {
    setUserContext();
    const { container } = mount();
    expect(container).toBeEmptyDOMElement();
  });

  it("counts unread notifications", () => {
    mocks.notifications = [{ read: false }, { read: true }, { read: false }];
    mount();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("caps the badge at 9+", () => {
    mocks.notifications = Array.from({ length: 12 }, () => ({ read: false }));
    mount();
    expect(screen.getByText("9+")).toBeInTheDocument();
  });

  it("opens the notification modal", async () => {
    mount();
    await userEvent.click(screen.getByTitle("notifications"));
    expect(mocks.showModal).toHaveBeenCalled();
  });
});

describe("CreateButton", () => {
  const state = {
    isVisibleButton: false,
    hideButton: jest.fn(),
    showButton: jest.fn(),
    showModal: jest.fn(),
  };
  beforeEach(() => {
    state.isVisibleButton = false;
    state.hideButton = jest.fn();
    state.showButton = jest.fn();
    state.showModal = jest.fn();
    mockCreate.mockImplementation(() => state);
  });

  it("is hidden for logged out visitors", () => {
    setUserContext();
    render(<CreateButton />);
    expect(state.hideButton).toHaveBeenCalled();
    expect(state.showButton).not.toHaveBeenCalled();
  });

  it("is offered on ordinary pages", () => {
    setLocation("/discover");
    render(<CreateButton />);
    expect(state.showButton).toHaveBeenCalled();
  });

  it.each([
    "/createOrganisation",
    "/createExponat",
    "/createPost",
    "/login",
    "/register",
    "/activateUser",
    "/resetPassword",
  ])("is hidden on %s", (path) => {
    setLocation(path);
    render(<CreateButton />);
    expect(state.hideButton).toHaveBeenCalled();
    expect(state.showButton).not.toHaveBeenCalled();
  });

  it("opens the creation modal and hides itself when clicked", async () => {
    state.isVisibleButton = true;
    render(<CreateButton />);
    await userEvent.click(screen.getByRole("button", { name: "Kreiraj" }));
    expect(state.showModal).toHaveBeenCalled();
    expect(state.hideButton).toHaveBeenCalled();
  });

  it("renders nothing while not visible", () => {
    const { container } = render(<CreateButton />);
    expect(container).toBeEmptyDOMElement();
  });
});
