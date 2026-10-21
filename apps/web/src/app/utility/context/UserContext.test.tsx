import { act, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import useUser, { UserContext, UserProvider } from "./UserContext";

const mocks = {
  me: { data: undefined as any, isLoading: false },
  followers: { data: undefined as any, isLoading: false },
  following: { data: undefined as any, isLoading: false },
  organisations: { data: undefined as any, isLoading: false },
  works: { data: undefined as any, isLoading: false },
  literature: { data: undefined as any, isLoading: false },
};

jest.mock("@/api/useGetMe", () => ({ useGetMe: () => mocks.me }));
jest.mock("@/api/useGetFollowers", () => ({
  useGetFollowers: () => mocks.followers,
}));
jest.mock("@/api/useGetFollowing", () => ({
  useGetFollowing: () => mocks.following,
}));
jest.mock("@/api/useGetFollowedOrganisations", () => ({
  useGetFollowedOrganisations: () => mocks.organisations,
}));
jest.mock("@/api/useGetMySavedWorks", () => ({
  useGetMySavedWorks: () => mocks.works,
}));
jest.mock("@/api/useGetMySavedLiterature", () => ({
  useGetMySavedLiterature: () => mocks.literature,
}));

const profile = (over: Record<string, unknown> = {}) => ({
  id: "u1",
  likedPosts: [{ id: "p1" }],
  favouriteExponats: [{ id: "e1" }, { id: "e2" }],
  memberships: [{ id: "o1" }],
  posts: [{ id: "p9" }],
  ...over,
});

let ctx: ReturnType<typeof useUser>;
const Probe = () => {
  ctx = useUser();
  return <div data-testid="state">{ctx.loading ? "loading" : "ready"}</div>;
};
const mount = () =>
  render(
    <UserProvider>
      <Probe />
    </UserProvider>,
  );

const ids = (list: { id?: string; literatureId?: string }[]) =>
  list.map((x) => x.id ?? x.literatureId);

beforeEach(() => {
  for (const key of Object.keys(mocks) as (keyof typeof mocks)[])
    mocks[key] = { data: undefined, isLoading: false };
});

describe("UserContext without a provider", () => {
  it("exposes safe defaults", () => {
    let seen: ReturnType<typeof useUser> | undefined;
    const Reader = () => {
      seen = useUser();
      return null;
    };
    render(<Reader />);
    expect(seen).toMatchObject({
      user: undefined,
      loading: false,
      likedPosts: [],
      followers: [],
      savedWorks: [],
    });
    expect(() => seen!.updateLikes({} as any)).not.toThrow();
  });
});

describe("UserProvider", () => {
  it("has no user and empty lists while logged out", () => {
    mount();
    expect(ctx.user).toBeUndefined();
    expect(ctx.likedPosts).toEqual([]);
    expect(ctx.memberships).toEqual([]);
  });

  it("seeds the profile lists from the logged in user", () => {
    mocks.me = { data: profile(), isLoading: false };
    mount();
    expect(ctx.user?.id).toBe("u1");
    expect(ids(ctx.likedPosts)).toEqual(["p1"]);
    expect(ids(ctx.favouriteExponats)).toEqual(["e1", "e2"]);
    expect(ids(ctx.memberships)).toEqual(["o1"]);
    expect(ids(ctx.posts)).toEqual(["p9"]);
  });

  it("update* toggles an item: adds it when absent, removes it when present", () => {
    mocks.me = { data: profile(), isLoading: false };
    mount();

    act(() => ctx.updateFavourites({ id: "e3" } as any));
    expect(ids(ctx.favouriteExponats)).toEqual(["e1", "e2", "e3"]);

    act(() => ctx.updateFavourites({ id: "e1" } as any));
    expect(ids(ctx.favouriteExponats)).toEqual(["e2", "e3"]);

    act(() => ctx.updateLikes({ id: "p1" } as any));
    expect(ctx.likedPosts).toEqual([]);

    act(() => ctx.updateMemberships({ id: "o2" } as any));
    expect(ids(ctx.memberships)).toEqual(["o1", "o2"]);
  });

  it("resets the lists when the user changes", () => {
    mocks.me = { data: profile(), isLoading: false };
    const { rerender } = mount();
    mocks.me = {
      data: profile({
        id: "u2",
        likedPosts: [],
        favouriteExponats: [],
        memberships: [],
        posts: [],
      }),
      isLoading: false,
    };
    rerender(
      <UserProvider>
        <Probe />
      </UserProvider>,
    );
    expect(ctx.user?.id).toBe("u2");
    expect(ctx.favouriteExponats).toEqual([]);
  });

  it("fills follow and saved lists from their queries", async () => {
    mocks.followers = { data: [{ id: "f1" }], isLoading: false };
    mocks.following = { data: [{ id: "g1" }, { id: "g2" }], isLoading: false };
    mocks.organisations = { data: [{ id: "o5" }], isLoading: false };
    mocks.works = { data: [{ id: "w1" }], isLoading: false };
    mocks.literature = { data: [{ literatureId: "l1" }], isLoading: false };
    mount();
    await waitFor(() => expect(ids(ctx.followers)).toEqual(["f1"]));
    expect(ids(ctx.following)).toEqual(["g1", "g2"]);
    expect(ids(ctx.followedOrganisations)).toEqual(["o5"]);
    expect(ids(ctx.savedWorks)).toEqual(["w1"]);
    expect(ids(ctx.savedLiterature)).toEqual(["l1"]);
  });

  it("saved literature is keyed by literatureId", async () => {
    mocks.literature = { data: [{ literatureId: "l1" }], isLoading: false };
    mount();
    await waitFor(() => expect(ctx.savedLiterature).toHaveLength(1));
    act(() => ctx.updateSavedLiterature({ literatureId: "l1" } as any));
    expect(ctx.savedLiterature).toEqual([]);
    act(() => ctx.updateSavedLiterature({ literatureId: "l2" } as any));
    expect(ids(ctx.savedLiterature)).toEqual(["l2"]);
  });

  it.each([
    ["the profile", "me"],
    ["followers", "followers"],
    ["following", "following"],
    ["followed organisations", "organisations"],
    ["saved works", "works"],
    ["saved literature", "literature"],
  ] as const)("is loading while %s load", (_n, key) => {
    mocks[key] = { data: undefined, isLoading: true };
    mount();
    expect(screen.getByTestId("state")).toHaveTextContent("loading");
  });

  it("is ready once everything has loaded", () => {
    mount();
    expect(screen.getByTestId("state")).toHaveTextContent("ready");
  });

  describe("logout", () => {
    afterEach(() => jest.useRealTimers());

    it("removes the token and goes to the home page after a second", () => {
      jest.useFakeTimers();
      localStorage.setItem("access_token", "tok");
      const hrefs: string[] = [];
      const original = window.location;
      Object.defineProperty(window, "location", {
        configurable: true,
        value: {
          ...original,
          set href(v: string) {
            hrefs.push(v);
          },
        },
      });
      mount();
      act(() => ctx.logout!());
      expect(localStorage.getItem("access_token")).toBeNull();
      expect(hrefs).toEqual([]);
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(hrefs).toEqual(["/"]);
      Object.defineProperty(window, "location", {
        configurable: true,
        value: original,
      });
    });

    it("also clears the stored login time", () => {
      jest.useFakeTimers();
      localStorage.setItem("loggedTime", "2024-01-01");
      mount();
      act(() => ctx.logout!());
      expect(localStorage.getItem("loggedTime")).toBeNull();
    });
  });

  it("the context can be consumed directly", () => {
    render(
      <UserContext.Provider value={{ loading: true } as any}>
        <Probe />
      </UserContext.Provider>,
    );
    expect(screen.getByTestId("state")).toHaveTextContent("loading");
  });
});
