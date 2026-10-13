import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockRouter } from "test-utils/router";
import { setUserContext } from "test-utils/userContext";

jest.mock("@/utility/context/UserContext", () => ({
  __esModule: true,
  default: () => require("test-utils/userContext").mockUserContext,
}));

const api = {
  updateRole: { mutateAsync: jest.fn() },
  ownerUpdateRole: { mutateAsync: jest.fn() },
  transfer: { mutateAsync: jest.fn() },
  markAll: { mutateAsync: jest.fn() },
  exponats: { data: undefined as any },
};
jest.mock("@/api/useUpdateUserRole", () => ({
  useUpdateUserRole: () => api.updateRole,
}));
jest.mock("@/api/useOwnerUpdateUserRole", () => ({
  useOwnerUpdateUserRole: () => api.ownerUpdateRole,
}));
jest.mock("@/api/useTransferOwnership", () => ({
  useTransferOwnership: () => api.transfer,
}));
jest.mock("@/api/useMarkAllAsRead", () => ({
  useMarkAllAsRead: () => api.markAll,
}));
jest.mock("@/api/useGetExponatsForOrganisation", () => ({
  useGetExponatsForOrganisation: (...args: unknown[]) => {
    mockExponatQuery(...args);
    return api.exponats;
  },
}));
const mockExponatQuery = jest.fn();

const mockCreateButton = {
  isVisibleModal: true,
  hideButton: jest.fn(),
  hideModal: jest.fn(),
};
jest.mock("@/utility/context/CreateButtonContext", () => ({
  __esModule: true,
  default: () => mockCreateButton,
}));
const mockNotifications = {
  notifications: [] as any[],
  isVisibleModal: true,
  hideModal: jest.fn(),
  markAllAsRead: jest.fn(),
};
jest.mock("@/utility/context/NotificationContext", () => ({
  __esModule: true,
  default: () => mockNotifications,
}));
const mockSideMenu = { active: false, toggleActive: jest.fn() };
jest.mock("@/utility/context/SideMenuContext", () => ({
  __esModule: true,
  default: () => mockSideMenu,
}));
jest.mock("components/NotificationCard/NotificationCard", () => ({
  __esModule: true,
  NotificationCard: ({ notification }: any) => (
    <li data-testid="notification">{notification.title}</li>
  ),
}));
jest.mock("components/SpeechToText", () => ({
  __esModule: true,
  default: () => null,
}));

import { CreationModal } from "../CreationModal/CreationModal";
import { EditUserRoleModal } from "../EditUserRoleModal/EditUserRoleModal";
import { NotificationModal } from "../NotificationModal/NotificationModal";
import SideMenu from "../SideMenu/SideMenu";

beforeEach(() => {
  setUserContext({ user: { id: "me" } });
  api.updateRole.mutateAsync.mockResolvedValue({});
  api.ownerUpdateRole.mutateAsync.mockResolvedValue({});
  api.transfer.mutateAsync.mockResolvedValue({});
  api.markAll.mutateAsync.mockResolvedValue({});
  api.exponats = { data: undefined };
  mockCreateButton.isVisibleModal = true;
  mockNotifications.notifications = [];
  mockNotifications.isVisibleModal = true;
  mockSideMenu.active = false;
  jest.spyOn(window, "confirm").mockReturnValue(true);
});

describe("EditUserRoleModal", () => {
  const open = async (props: Record<string, unknown> = {}) => {
    render(
      <EditUserRoleModal
        userId="u2"
        organisationId="o1"
        userRole="MEMBER"
        {...props}
      />,
    );
    await userEvent.click(screen.getByText("Promijeni ulogu"));
  };
  const optionLabels = () =>
    within(screen.getByRole("combobox"))
      .getAllByRole("option")
      .map((o) => o.textContent);

  describe("who may be edited", () => {
    it("members are editable by admins", () => {
      setUserContext({
        user: { id: "me" },
        memberships: [{ id: "o1", role: "ADMIN" }],
      });
      render(
        <EditUserRoleModal userId="u2" organisationId="o1" userRole="MEMBER" />,
      );
      expect(screen.getByText("Promijeni ulogu")).toBeInTheDocument();
    });

    it("nobody can change their own role", () => {
      setUserContext({
        user: { id: "me" },
        memberships: [{ id: "o1", role: "OWNER" }],
      });
      render(
        <EditUserRoleModal userId="me" organisationId="o1" userRole="OWNER" />,
      );
      expect(screen.queryByText("Promijeni ulogu")).toBeNull();
    });

    it.each(["OWNER", "ADMIN"])("admins cannot edit an %s", (role) => {
      setUserContext({
        user: { id: "me" },
        memberships: [{ id: "o1", role: "ADMIN" }],
      });
      render(
        <EditUserRoleModal userId="u2" organisationId="o1" userRole={role} />,
      );
      expect(screen.queryByText("Promijeni ulogu")).toBeNull();
    });

    it("owners can edit admins", () => {
      setUserContext({
        user: { id: "me" },
        memberships: [{ id: "o1", role: "OWNER" }],
      });
      render(
        <EditUserRoleModal userId="u2" organisationId="o1" userRole="ADMIN" />,
      );
      expect(screen.getByText("Promijeni ulogu")).toBeInTheDocument();
    });
  });

  describe("offered roles", () => {
    it("admins can only choose member or requested", async () => {
      setUserContext({
        user: { id: "me" },
        memberships: [{ id: "o1", role: "ADMIN" }],
      });
      await open();
      expect(optionLabels()).toEqual(["Član", "Zahtjev (nije član)"]);
    });

    it("owners can choose every role", async () => {
      setUserContext({
        user: { id: "me" },
        memberships: [{ id: "o1", role: "OWNER" }],
      });
      await open();
      expect(optionLabels()).toEqual([
        "Admin",
        "Član",
        "Vlasnik",
        "Zahtjev (nije član)",
      ]);
    });
  });

  describe("saving", () => {
    const save = () =>
      userEvent.click(screen.getByRole("button", { name: "Promijeni ulogu" }));

    it("admins use the member endpoint", async () => {
      setUserContext({
        user: { id: "me" },
        memberships: [{ id: "o1", role: "ADMIN" }],
      });
      await open({ userRole: "REQUESTED" });
      await userEvent.selectOptions(screen.getByRole("combobox"), "MEMBER");
      await save();
      await waitFor(() =>
        expect(api.updateRole.mutateAsync).toHaveBeenCalledWith({
          organisationId: "o1",
          userId: "u2",
          role: "MEMBER",
        }),
      );
      expect(api.ownerUpdateRole.mutateAsync).not.toHaveBeenCalled();
    });

    it("owners use the owner endpoint for ordinary roles", async () => {
      setUserContext({
        user: { id: "me" },
        memberships: [{ id: "o1", role: "OWNER" }],
      });
      await open();
      await userEvent.selectOptions(screen.getByRole("combobox"), "ADMIN");
      await save();
      await waitFor(() =>
        expect(api.ownerUpdateRole.mutateAsync).toHaveBeenCalledWith({
          organisationId: "o1",
          userId: "u2",
          role: "ADMIN",
        }),
      );
      expect(api.transfer.mutateAsync).not.toHaveBeenCalled();
    });

    it("choosing OWNER transfers the ownership", async () => {
      setUserContext({
        user: { id: "me" },
        memberships: [{ id: "o1", role: "OWNER" }],
      });
      await open();
      await userEvent.selectOptions(screen.getByRole("combobox"), "OWNER");
      await save();
      await waitFor(() => expect(api.transfer.mutateAsync).toHaveBeenCalled());
      expect(api.ownerUpdateRole.mutateAsync).not.toHaveBeenCalled();
    });

    it("asks for confirmation and does nothing when declined", async () => {
      (window.confirm as jest.Mock).mockReturnValue(false);
      setUserContext({
        user: { id: "me" },
        memberships: [{ id: "o1", role: "ADMIN" }],
      });
      await open();
      await save();
      await waitFor(() => expect(window.confirm).toHaveBeenCalled());
      expect(api.updateRole.mutateAsync).not.toHaveBeenCalled();
    });

    it("closes after saving and tells the parent", async () => {
      const onClose = jest.fn();
      setUserContext({
        user: { id: "me" },
        memberships: [{ id: "o1", role: "ADMIN" }],
      });
      await open({ onClose });
      await save();
      await waitFor(() => expect(onClose).toHaveBeenCalled());
      expect(screen.queryByText("Mijenjanje uloge korisnika")).toBeNull();
    });
  });
});

describe("CreationModal", () => {
  const memberships = [
    { id: "o1", name: "Muzej", role: "ADMIN" },
    { id: "o2", name: "Zoo", role: "MEMBER" },
    { id: "o3", name: "Čekam", role: "REQUESTED" },
  ];
  const choose = (value: string) =>
    userEvent.selectOptions(screen.getAllByRole("combobox")[0], value);
  const create = () =>
    userEvent.click(screen.getByRole("button", { name: "Kreiraj" }));

  it("is hidden while the modal is closed", () => {
    mockCreateButton.isVisibleModal = false;
    render(<CreationModal />);
    expect(screen.queryByText("Kreiraj novi entitet")).toBeNull();
  });

  it("creating an organisation does not need to pick one", async () => {
    setUserContext({ user: { id: "me" }, memberships });
    render(<CreationModal />);
    expect(screen.getAllByRole("combobox")).toHaveLength(1);
    await create();
    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith("/createOrganisation"),
    );
    expect(mockCreateButton.hideModal).toHaveBeenCalled();
  });

  it("an exponat is created inside one of the user's organisations", async () => {
    setUserContext({ user: { id: "me" }, memberships });
    render(<CreationModal />);
    await choose("exponat");
    await create();
    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith(
        "/organisation/o1/createExponat",
      ),
    );
  });

  it("pending membership requests are not offered as organisations", async () => {
    setUserContext({ user: { id: "me" }, memberships });
    render(<CreationModal />);
    await choose("work");
    const organisations = screen.getAllByRole("combobox")[1];
    expect(
      within(organisations)
        .getAllByRole("option")
        .map((o) => o.textContent),
    ).toEqual(["Muzej", "Zoo"]);
  });

  it("a work goes to the chosen organisation", async () => {
    setUserContext({ user: { id: "me" }, memberships });
    render(<CreationModal />);
    await choose("work");
    await userEvent.selectOptions(screen.getAllByRole("combobox")[1], "o2");
    await create();
    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith(
        "/organisation/o2/createWork",
      ),
    );
  });

  it("a post is created for one of the organisation's exponats", async () => {
    setUserContext({ user: { id: "me" }, memberships });
    api.exponats = {
      data: [
        { id: "e1", name: "Lisica" },
        { id: "e2", name: "Vuk" },
      ],
    };
    render(<CreationModal />);
    await choose("post");
    expect(mockExponatQuery).toHaveBeenCalledWith("o1");
    await userEvent.selectOptions(screen.getAllByRole("combobox")[2], "e2");
    await create();
    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith("/exponat/e2/createPost"),
    );
  });

  it("without exponats a post cannot be started", async () => {
    setUserContext({ user: { id: "me" }, memberships });
    api.exponats = { data: [] };
    render(<CreationModal />);
    await choose("post");
    const exponats = screen.getAllByRole("combobox")[2];
    expect(exponats).toBeDisabled();
    expect(
      screen.getByRole("option", { name: "Nema dostupnih eksponata" }),
    ).toBeInTheDocument();
    await create();
    await new Promise((r) => setTimeout(r, 30));
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("closing hides both the button and the modal", async () => {
    setUserContext({ user: { id: "me" }, memberships });
    render(<CreationModal />);
    await userEvent.click(screen.getByRole("button", { name: "Zatvori" }));
    expect(mockCreateButton.hideButton).toHaveBeenCalled();
    expect(mockCreateButton.hideModal).toHaveBeenCalled();
  });
});

describe("NotificationModal", () => {
  const note = (id: string, title: string, createdAt: string) => ({
    id,
    title,
    createdAt,
  });

  it("says so when there are no notifications", () => {
    render(<NotificationModal />);
    expect(screen.getByText("Nema obavijesti")).toBeInTheDocument();
  });

  it("lists the newest notification first", () => {
    mockNotifications.notifications = [
      note("1", "Najstarija", "2024-01-01T10:00:00Z"),
      note("3", "Najnovija", "2024-03-01T10:00:00Z"),
      note("2", "Srednja", "2024-02-01T10:00:00Z"),
    ];
    render(<NotificationModal />);
    expect(
      screen.getAllByTestId("notification").map((n) => n.textContent),
    ).toEqual(["Najnovija", "Srednja", "Najstarija"]);
  });

  it("marks everything as read on the server and locally", async () => {
    render(<NotificationModal />);
    await userEvent.click(
      screen.getByRole("button", { name: "Označi sve kao pročitano" }),
    );
    expect(api.markAll.mutateAsync).toHaveBeenCalled();
    await waitFor(() =>
      expect(mockNotifications.markAllAsRead).toHaveBeenCalled(),
    );
  });

  it("the close button hides the modal", async () => {
    render(<NotificationModal />);
    await userEvent.click(screen.getByRole("button", { name: "Zatvori" }));
    expect(mockNotifications.hideModal).toHaveBeenCalled();
  });

  it("is not shown while hidden", () => {
    mockNotifications.isVisibleModal = false;
    render(<NotificationModal />);
    expect(screen.queryByText("Obavijesti")).toBeNull();
  });

  // The list is sorted in place, which reorders the context's own array.
  it.failing("does not reorder the notifications held by the context", () => {
    mockNotifications.notifications = [
      note("1", "Najstarija", "2024-01-01T10:00:00Z"),
      note("2", "Najnovija", "2024-03-01T10:00:00Z"),
    ];
    render(<NotificationModal />);
    expect(mockNotifications.notifications.map((n) => n.id)).toEqual([
      "1",
      "2",
    ]);
  });
});

describe("SideMenu", () => {
  it("greets a logged out visitor and links to the login", () => {
    setUserContext();
    render(<SideMenu />);
    expect(screen.getByText("Niste prijavljeni")).toBeInTheDocument();
    expect(screen.getAllByRole("link")[0]).toHaveAttribute("href", "/login");
  });

  it("shows the logged in user's name, county and profile link", () => {
    setUserContext({
      user: {
        id: "u1",
        firstName: "Ana",
        lastName: "Anić",
        location: "ISTARSKA",
      },
    });
    render(<SideMenu />);
    expect(screen.getByText("Ana Anić")).toBeInTheDocument();
    expect(screen.getByText("Istarska županija")).toBeInTheDocument();
    expect(screen.getAllByRole("link")[0]).toHaveAttribute("href", "/user/u1");
  });

  it("is open only when active, and the backdrop closes it", async () => {
    mockSideMenu.active = true;
    const { container } = render(<SideMenu />);
    expect(container.firstElementChild!.className).toMatch(/active/);
    await userEvent.click(container.firstElementChild as HTMLElement);
    expect(mockSideMenu.toggleActive).toHaveBeenCalled();
  });

  it("the search icon links to the search page with the typed name", async () => {
    setUserContext();
    render(<SideMenu />);
    await userEvent.type(screen.getByPlaceholderText("Pretraži..."), "lisica");
    const search = screen
      .getAllByRole("link")
      .find((a) => a.getAttribute("href")?.startsWith("/search"))!;
    expect(search.getAttribute("href")).toBe("/search?name=lisica");
  });

  it("logging out needs confirmation", async () => {
    const ctx = setUserContext({ user: { id: "u1" } });
    render(<SideMenu />);
    const logout = () => screen.getAllByRole("button").at(-1)!;
    (window.confirm as jest.Mock).mockReturnValueOnce(false);
    await userEvent.click(logout());
    expect(ctx.logout).not.toHaveBeenCalled();
    await userEvent.click(logout());
    expect(ctx.logout).toHaveBeenCalled();
  });
});
