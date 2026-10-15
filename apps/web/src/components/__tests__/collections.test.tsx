import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setUserContext } from "test-utils/userContext";

jest.mock("@/utility/context/UserContext", () => ({
  __esModule: true,
  default: () => require("test-utils/userContext").mockUserContext,
}));

jest.mock("components/ExponatCard", () => ({
  __esModule: true,
  ExponatCard: require("test-utils/stubs").entityStub("exponat", "exponat"),
}));
jest.mock("components/PostCard", () => ({
  __esModule: true,
  PostCard: require("test-utils/stubs").entityStub("post", "post"),
}));
jest.mock("components/OrganisationCard", () => ({
  __esModule: true,
  default: require("test-utils/stubs").entityStub(
    "organisation",
    "organisation",
  ),
}));
jest.mock("components/WorkCard", () => ({
  __esModule: true,
  default: require("test-utils/stubs").entityStub("work", "work"),
}));
jest.mock("components/MembershipCard", () => ({
  __esModule: true,
  default: require("test-utils/stubs").entityStub("membership", "object"),
}));

import { CardCollection } from "../CardCollection/CardCollection";
import { CardCollectionAsync } from "../CardCollectionAsync/CardCollectionAsync";
import { CollectionCard } from "../CardCollection/CollectionCard";
import { useCardPermissions } from "../CardCollection/useCardPermissions";
import { renderHook } from "@testing-library/react";

const permissions = () => renderHook(() => useCardPermissions()).result.current;

describe("CollectionCard", () => {
  const render_ = (type: any, item: any, extra: Record<string, unknown> = {}) =>
    render(
      <CollectionCard
        type={type}
        item={item}
        permissions={permissions()}
        onRemove={jest.fn()}
        {...extra}
      />,
    );

  it.each([
    ["exponat", "exponat"],
    ["post", "post"],
    ["organisation", "organisation"],
    ["work", "work"],
    ["literature", "work"],
  ])("renders a %s with the matching card", (type, testId) => {
    setUserContext();
    render_(type, { id: "x1" });
    expect(screen.getByTestId(testId)).toHaveAttribute("data-id", "x1");
  });

  it.each([
    ["user", "isFollowCard=true"],
    ["user-member", "isFollowCard=false"],
  ])("a %s becomes a membership card (%s)", (type, flag) => {
    setUserContext();
    render_(type, {
      id: "u1",
      username: "ana",
      email: "a@b.hr",
      role: "ADMIN",
      location: "ISTARSKA",
    });
    expect(screen.getByTestId("membership")).toHaveTextContent(flag);
    expect(screen.getByTestId("membership")).toHaveTextContent("type=user");
  });

  it("user cards show the role only for members, the county otherwise", () => {
    setUserContext();
    const user = {
      id: "u1",
      username: "ana",
      email: "a@b.hr",
      role: "ADMIN",
      location: "ISTARSKA",
    };
    const { unmount } = render_("user", user);
    expect(screen.getByTestId("membership")).toHaveTextContent("role=ISTARSKA");
    unmount();
    render_("user-member", user);
    expect(screen.getByTestId("membership")).toHaveTextContent("role=ADMIN");
  });

  it("organisation memberships carry the user's own role in that organisation", () => {
    setUserContext();
    render_(
      "organisation-member",
      { id: "o1", name: "Muzej", role: "OWNER", location: "ZADARSKA" },
      { userId: "u1" },
    );
    expect(screen.getByTestId("membership")).toHaveTextContent(
      "type=organisation",
    );
    expect(screen.getByTestId("membership")).toHaveTextContent("role=OWNER");
  });

  describe("permissions passed to the cards", () => {
    it("exponats are administrable by admins of the owning organisation", () => {
      setUserContext({ memberships: [{ id: "o1", role: "ADMIN" }] });
      render_("exponat", { id: "e1", organizationId: "o1" });
      expect(screen.getByTestId("exponat")).toHaveTextContent("isAdmin=true");
    });

    it("exponats of other organisations are not", () => {
      setUserContext({ memberships: [{ id: "o1", role: "ADMIN" }] });
      render_("exponat", { id: "e1", organizationId: "o2" });
      expect(screen.getByTestId("exponat")).toHaveTextContent("isAdmin=false");
    });

    it("posts: the author is recognised, admin rights come from the post's organisation", () => {
      setUserContext({
        user: { id: "u1", role: "USER" },
        memberships: [{ id: "o1", role: "OWNER" }],
      });
      render_("post", { id: "p1", authorId: "u1", organisationId: "o1" });
      const text = screen.getByTestId("post").textContent;
      expect(text).toContain("isUser=true");
      expect(text).toContain("isAdmin=true");
    });

    it("posts: an explicit organisation id overrides the post's own", () => {
      setUserContext({ memberships: [{ id: "o9", role: "ADMIN" }] });
      render_(
        "post",
        { id: "p1", authorId: "u2", organisationId: "o1" },
        { organisationId: "o9" },
      );
      expect(screen.getByTestId("post").textContent).toContain("isAdmin=true");
    });

    it("works are administrable by admins of the organisation", () => {
      setUserContext({ memberships: [{ id: "o1", role: "ADMIN" }] });
      render_("work", { id: "w1", organisationId: "o1" });
      expect(screen.getByTestId("work")).toHaveTextContent("isAdmin=true");
    });

    it("literature (GBIF) is never administrable", () => {
      setUserContext({ user: { id: "u1", role: "SUPER" } });
      render_("literature", { id: "l1", organisationId: "GBIF" });
      expect(screen.getByTestId("work").textContent).not.toContain("isAdmin");
    });
  });
});

describe("CardCollection", () => {
  const items = (...names: string[]): any =>
    names.map((name, i) => ({
      id: `id-${name}`,
      name,
      points: (i + 1) * 10,
      organizationId: "o1",
    }));
  const sortBy = [
    { label: "Ime", value: "name" },
    { label: "Bodovi", value: "points" },
  ];
  const ids = () =>
    screen.getAllByTestId("exponat").map((e) => e.getAttribute("data-id"));

  beforeEach(() => setUserContext());

  it("shows a message when there is nothing to show", () => {
    render(<CardCollection items={[]} type="exponat" sortBy={sortBy} />);
    expect(screen.getByText("Nema rezultata")).toBeInTheDocument();
  });

  it("sorts by the first sort option, ascending, by default", async () => {
    render(
      <CardCollection
        items={items("Cc", "Aa", "Bb")}
        type="exponat"
        sortBy={sortBy}
      />,
    );
    await waitFor(() => expect(ids()).toEqual(["id-Aa", "id-Bb", "id-Cc"]));
  });

  it("the direction button reverses the order", async () => {
    render(
      <CardCollection
        items={items("Cc", "Aa", "Bb")}
        type="exponat"
        sortBy={sortBy}
      />,
    );
    expect(screen.getByText("Rastuće")).toBeInTheDocument();
    await userEvent.click(screen.getByTitle("direkcija sortiranja"));
    expect(screen.getByText("Opadajuće")).toBeInTheDocument();
    expect(ids()).toEqual(["id-Cc", "id-Bb", "id-Aa"]);
  });

  it("numeric attributes sort by value, not alphabetically", async () => {
    const numbers: any = [
      { id: "a", name: "x", points: 9 },
      { id: "b", name: "x", points: 100 },
      { id: "c", name: "x", points: 25 },
    ];
    render(<CardCollection items={numbers} type="exponat" sortBy={sortBy} />);
    await userEvent.selectOptions(screen.getByTitle("sortBy"), "points");
    expect(ids()).toEqual(["a", "c", "b"]);
  });

  it("shows one page and loads more on scroll to the bottom", async () => {
    const many: any = Array.from({ length: 5 }, (_, i) => ({
      id: `i${i}`,
      name: `n${i}`,
    }));
    render(
      <CardCollection
        items={many}
        type="exponat"
        sortBy={sortBy}
        pageSize={2}
      />,
    );
    await waitFor(() => expect(ids()).toHaveLength(2));
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      configurable: true,
      value: 500,
    });
    Object.defineProperty(document.documentElement, "scrollTop", {
      configurable: true,
      value: 500,
    });
    act(() => {
      fireEvent.scroll(window);
    });
    await waitFor(() => expect(ids()).toHaveLength(4));
  });

  it("a removed card disappears from the list", async () => {
    // the stub does not expose onRemove, so drive it through the real prop
    const { rerender } = render(
      <CardCollection
        items={items("Aa", "Bb")}
        type="exponat"
        sortBy={sortBy}
      />,
    );
    expect(ids()).toHaveLength(2);
    rerender(
      <CardCollection items={items("Aa")} type="exponat" sortBy={sortBy} />,
    );
    await waitFor(() => expect(ids()).toEqual(["id-Aa"]));
  });

  // BUG: the list is sorted in place (`itemsToShow.sort(...)`) and
  // itemsToShow starts out as the very array passed in, so rendering reorders
  // the parent's `items` prop.
  it.failing("does not reorder the array it was given", async () => {
    const given = items("Cc", "Aa", "Bb");
    render(<CardCollection items={given} type="exponat" sortBy={sortBy} />);
    await waitFor(() => expect(ids()).toHaveLength(3));
    expect(given.map((i: any) => i.name)).toEqual(["Cc", "Aa", "Bb"]);
  });
});

describe("CardCollectionAsync", () => {
  const page = (...ids: string[]): any => ids.map((id) => ({ id, name: id }));
  const shown = () =>
    screen.getAllByTestId("exponat").map((e) => e.getAttribute("data-id"));
  const scrollToBottom = () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      configurable: true,
      value: 500,
    });
    Object.defineProperty(document.documentElement, "scrollTop", {
      configurable: true,
      value: 500,
    });
    act(() => {
      fireEvent.scroll(window);
    });
  };
  beforeEach(() => setUserContext());

  it("shows a message without results", () => {
    render(
      <CardCollectionAsync
        items={[]}
        type="exponat"
        page={1}
        params={{}}
        getMore={jest.fn()}
      />,
    );
    expect(screen.getByText("Nema rezultata")).toBeInTheDocument();
  });

  it("renders the first page", () => {
    render(
      <CardCollectionAsync
        items={page("a", "b")}
        type="exponat"
        page={1}
        params={{}}
        getMore={jest.fn()}
      />,
    );
    expect(shown()).toEqual(["a", "b"]);
  });

  it("loads more on scroll, appending only items it does not have yet", async () => {
    const getMore = jest.fn().mockResolvedValue(page("b", "c"));
    render(
      <CardCollectionAsync
        items={page("a", "b")}
        type="exponat"
        page={2}
        params={{ q: 1 }}
        getMore={getMore}
      />,
    );
    scrollToBottom();
    await waitFor(() => expect(shown()).toEqual(["a", "b", "c"]));
    expect(getMore).toHaveBeenCalledWith({ q: 1 }, 2);
  });

  it("discover mode calls getMore without arguments", async () => {
    const getMore = jest.fn().mockResolvedValue(page("z"));
    render(
      <CardCollectionAsync
        items={page("a")}
        type="exponat"
        page={1}
        params={{}}
        getMore={getMore}
        isDiscover
      />,
    );
    scrollToBottom();
    await waitFor(() => expect(getMore).toHaveBeenCalledWith());
  });

  it("does not start a second request while one is running", async () => {
    let resolve!: (v: unknown) => void;
    const getMore = jest
      .fn()
      .mockReturnValue(new Promise((r) => (resolve = r)));
    render(
      <CardCollectionAsync
        items={page("a")}
        type="exponat"
        page={1}
        params={{}}
        getMore={getMore}
      />,
    );
    scrollToBottom();
    scrollToBottom();
    scrollToBottom();
    expect(getMore).toHaveBeenCalledTimes(1);
    await act(async () => resolve(page("b")));
  });

  it("shows a spinner while more items are being loaded", async () => {
    let resolve!: (v: unknown) => void;
    const getMore = jest
      .fn()
      .mockReturnValue(new Promise((r) => (resolve = r)));
    render(
      <CardCollectionAsync
        items={page("a")}
        type="exponat"
        page={1}
        params={{}}
        getMore={getMore}
      />,
    );
    expect(document.querySelector('[class*="spinner"]')).toBeNull();
    scrollToBottom();
    await waitFor(() =>
      expect(document.querySelector('[class*="spinner"]')).toBeInTheDocument(),
    );
    await act(async () => resolve(page("b")));
    await waitFor(() =>
      expect(document.querySelector('[class*="spinner"]')).toBeNull(),
    );
  });

  // BUG: the effect that resets the list when `items` changes also calls
  // setLoading(false) on mount, overriding the `isLoading` prop, so a
  // collection that is rendered while loading never shows its spinner.
  it.failing("honours isLoading on first render", () => {
    render(
      <CardCollectionAsync
        items={page("a")}
        type="exponat"
        page={1}
        params={{}}
        getMore={jest.fn()}
        isLoading
      />,
    );
    expect(document.querySelector('[class*="spinner"]')).toBeInTheDocument();
  });

  it("stops requesting and reports the failure when loading throws", async () => {
    const onError = jest.fn();
    const getMore = jest.fn().mockRejectedValue(new Error("down"));
    render(
      <CardCollectionAsync
        items={page("a")}
        type="exponat"
        page={1}
        params={{}}
        getMore={getMore}
        onError={onError}
      />,
    );
    scrollToBottom();
    await waitFor(() => expect(onError).toHaveBeenCalled());
    scrollToBottom();
    expect(getMore).toHaveBeenCalledTimes(1);
  });

  it("starts over when new items arrive (e.g. a new search)", async () => {
    const { rerender } = render(
      <CardCollectionAsync
        items={page("a")}
        type="exponat"
        page={1}
        params={{}}
        getMore={jest.fn()}
      />,
    );
    rerender(
      <CardCollectionAsync
        items={page("x", "y")}
        type="exponat"
        page={1}
        params={{}}
        getMore={jest.fn()}
      />,
    );
    await waitFor(() => expect(shown()).toEqual(["x", "y"]));
  });
});
