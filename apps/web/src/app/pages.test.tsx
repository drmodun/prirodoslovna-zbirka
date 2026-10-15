import React from "react";
import { redirect } from "next/navigation";

// ---- data layer ----------------------------------------------------------
const mockData = {
  exponats: jest.fn(),
  posts: jest.fn(),
  organisations: jest.fn(),
  users: jest.fn(),
  works: jest.fn(),
  gbifWorks: jest.fn(),
  gbifWork: jest.fn(),
  discoverExponats: jest.fn(),
  discoverPosts: jest.fn(),
  discoverOrganisations: jest.fn(),
  user: jest.fn(),
  organisation: jest.fn(),
  exponat: jest.fn(),
  post: jest.fn(),
  followers: jest.fn(),
  following: jest.fn(),
};
jest.mock("@/api/serverExponats", () => ({
  getExponats: (...a: any[]) => mockData.exponats(...a),
  discoverExponats: (...a: any[]) => mockData.discoverExponats(...a),
}));
jest.mock("@/api/serverPosts", () => ({
  getPosts: (...a: any[]) => mockData.posts(...a),
  discoverPosts: (...a: any[]) => mockData.discoverPosts(...a),
}));
jest.mock("@/api/serverOrganisations", () => ({
  getOrganisations: (...a: any[]) => mockData.organisations(...a),
  discoverOrganisations: (...a: any[]) => mockData.discoverOrganisations(...a),
}));
jest.mock("@/api/serverUsers", () => ({
  getUsers: (...a: any[]) => mockData.users(...a),
}));
jest.mock("@/api/serverWorks", () => ({
  getWorks: (...a: any[]) => mockData.works(...a),
}));
jest.mock("@/api/serverLiterature", () => ({
  getGbifWorks: (...a: any[]) => mockData.gbifWorks(...a),
  getGbifWork: (...a: any[]) => mockData.gbifWork(...a),
}));
jest.mock("@/api/serverUser", () => ({
  serverGetUser: (...a: any[]) => mockData.user(...a),
}));
jest.mock("@/api/serverOrganisation", () => ({
  serverGetOrganisation: (...a: any[]) => mockData.organisation(...a),
}));
jest.mock("@/api/serverExponat", () => ({
  serverGetExponat: (...a: any[]) => mockData.exponat(...a),
}));
jest.mock("@/api/serverPost", () => ({
  serverGetPost: (...a: any[]) => mockData.post(...a),
}));
jest.mock("@/api/serverFollows", () => ({
  getUserFollowers: (...a: any[]) => mockData.followers(...a),
  getUserFollowing: (...a: any[]) => mockData.following(...a),
}));
jest.mock("@/api/AI", () => ({
  exponatInfoPrompt: jest.fn(),
  ttsPrompt: jest.fn(),
  summarisePostPrompt: jest.fn(),
}));

// ---- the views the pages hand their data to: labelled markers --------------
jest.mock("@/views/DiscoverPageView", () => ({
  __esModule: true,
  default: require("test-utils/stubs").marker("DiscoverPageView"),
}));
jest.mock("@/views/SearchPageView/SearchPageView", () => ({
  SearchPageView: require("test-utils/stubs").marker("SearchPageView"),
}));
jest.mock("@/views/FollowsTable/FollowsTable", () => ({
  FollowsTable: require("test-utils/stubs").marker("FollowsTable"),
}));
jest.mock("@/views/OrganisationBody/OrganisationBody", () => ({
  OrganisationBody: require("test-utils/stubs").marker("OrganisationBody"),
}));
jest.mock("components/UserCard", () => ({
  __esModule: true,
  default: require("test-utils/stubs").marker("UserCard"),
}));
jest.mock("components/UserPageBody/UserPageBody", () => ({
  UserPageBody: require("test-utils/stubs").marker("UserPageBody"),
}));
jest.mock("@/utility/wrappers/userWrapper", () => ({
  UserWrapper: require("test-utils/stubs").marker("UserWrapper"),
}));
jest.mock("@/utility/wrappers/queryWrapper", () => ({
  QueryClientWrapper: require("test-utils/stubs").marker("QueryClientWrapper"),
}));
jest.mock("@/not-found", () => ({
  __esModule: true,
  default: require("test-utils/stubs").marker("NotFound"),
}));
jest.mock("@/views/PostView", () => ({
  __esModule: true,
  default: require("test-utils/stubs").marker("PostView"),
}));
jest.mock("@/utility/wrappers/postAsyncWrapper", () => ({
  PostAsyncWrapper: require("test-utils/stubs").marker("PostAsyncWrapper"),
}));
jest.mock("components/ExponatModal", () => ({
  __esModule: true,
  default: require("test-utils/stubs").marker("ExponatModal"),
}));
jest.mock("components/ExtrasExponatButton", () => ({
  __esModule: true,
  default: require("test-utils/stubs").marker("ExtrasExponatButton"),
}));
jest.mock("@/views/SingleExponatView.ts", () => ({
  __esModule: true,
  default: require("test-utils/stubs").marker("SingleExponatView"),
}));
jest.mock("@/utility/wrappers/exponatAsyncWrapper", () => ({
  ExponatAsyncWrapper: require("test-utils/stubs").marker(
    "ExponatAsyncWrapper",
  ),
}));

import DiscoverPage from "./discover/page";
import FollowsPage from "./follows/[userId]/page";
import ExponatPage from "./exponat/[exponatId]/page";
import OrganisationPage from "./organisation/[organisationId]/page";
import SearchPage from "./search/page";
import UserPage from "./user/[userId]/page";

/** Depth-first search of an element tree for the element with a display name. */
const find = (node: any, name: string): any => {
  if (!node || typeof node !== "object") return undefined;
  if (Array.isArray(node)) return node.map((n) => find(n, name)).find(Boolean);
  if (node.type?.displayName === name || node.type?.name === name) return node;
  return find(node.props?.children, name);
};
const named = (tree: any, name: string) => find(tree, name)?.props;

beforeEach(() => {
  for (const fn of Object.values(mockData)) fn.mockResolvedValue(undefined);
});

describe("DiscoverPage", () => {
  beforeEach(() => {
    mockData.discoverExponats.mockResolvedValue([{ id: "e1" }]);
    mockData.discoverPosts.mockResolvedValue([{ id: "p1" }]);
    mockData.discoverOrganisations.mockResolvedValue([{ id: "o1" }]);
    mockData.works.mockResolvedValue([{ id: "w1" }]);
    mockData.gbifWorks.mockResolvedValue([{ id: "g1" }]);
  });

  it("loads the first page of every feed", async () => {
    const props = named(
      await DiscoverPage({ params: {}, searchParams: {} }),
      "DiscoverPageView",
    );
    expect(mockData.discoverExponats).toHaveBeenCalledWith({
      page: 1,
      size: 20,
    });
    expect(mockData.discoverPosts).toHaveBeenCalledWith({ page: 1, size: 20 });
    expect(mockData.discoverOrganisations).toHaveBeenCalledWith({
      page: 1,
      size: 20,
    });
    expect(props).toMatchObject({
      exponats: [{ id: "e1" }],
      posts: [{ id: "p1" }],
      organisations: [{ id: "o1" }],
      works: [{ id: "w1" }],
      gbifWorks: [{ id: "g1" }],
    });
  });

  it.each([
    ["organisation", "Organizacije"],
    ["exponat", "Eksponati"],
    ["post", "Objave"],
    ["something-else", "Eksponati"],
    [undefined, "Eksponati"],
  ])("kind=%s opens the %s tab", async (kind, tab) => {
    const props = named(
      await DiscoverPage({ params: {}, searchParams: { kind } }),
      "DiscoverPageView",
    );
    expect(props.initTab).toBe(tab);
  });

  it("copes with failing works and literature requests", async () => {
    mockData.works.mockResolvedValue(undefined);
    mockData.gbifWorks.mockResolvedValue(undefined);
    const props = named(
      await DiscoverPage({ params: {}, searchParams: {} }),
      "DiscoverPageView",
    );
    expect(props.works).toEqual([]);
    expect(props.gbifWorks).toEqual([]);
  });
});

describe("SearchPage", () => {
  const run = async (searchParams: Record<string, unknown>) =>
    named(await SearchPage({ params: {}, searchParams }), "SearchPageView");

  it.each([
    ["user", "Korisnici"],
    ["organisation", "Organizacije"],
    ["exponat", "Eksponati"],
    ["post", "Objave"],
    ["work", "Radovi"],
    ["literature", "Literatura"],
    ["unknown", "Eksponati"],
  ])("kind=%s opens the %s tab", async (kind, tab) => {
    expect((await run({ kind })).initTab).toBe(tab);
  });

  it("runs all six searches and passes the results to the view", async () => {
    mockData.exponats.mockResolvedValue([{ id: "e" }]);
    mockData.posts.mockResolvedValue([{ id: "p" }]);
    mockData.organisations.mockResolvedValue([{ id: "o" }]);
    mockData.users.mockResolvedValue([{ id: "u" }]);
    mockData.works.mockResolvedValue([{ id: "w" }]);
    mockData.gbifWorks.mockResolvedValue([{ id: "l" }]);
    const props = await run({ kind: "post" });
    expect(props).toMatchObject({
      exponats: [{ id: "e" }],
      posts: [{ id: "p" }],
      organisations: [{ id: "o" }],
      users: [{ id: "u" }],
      works: [{ id: "w" }],
      literature: [{ id: "l" }],
      query: { kind: "post" },
    });
  });

  it("failed work and literature searches become empty lists", async () => {
    mockData.works.mockResolvedValue(undefined);
    mockData.gbifWorks.mockResolvedValue(undefined);
    const props = await run({});
    expect(props.works).toEqual([]);
    expect(props.literature).toEqual([]);
  });

  it("maps the shared `name` parameter onto each search", async () => {
    await run({ name: "lisica" });
    expect(mockData.exponats.mock.calls[0][0].name).toBe("lisica");
    expect(mockData.posts.mock.calls[0][0].title).toBe("lisica");
    expect(mockData.organisations.mock.calls[0][0].name).toBe("lisica");
    expect(mockData.users.mock.calls[0][0].username).toBe("lisica");
    expect(mockData.works.mock.calls[0][0].title).toBe("lisica");
    expect(mockData.gbifWorks.mock.calls[0][0].q).toBe("lisica");
  });

  it("title works as an alias of name, and username/q are specific to their search", async () => {
    await run({ title: "vuk", username: "ana", q: "birds" });
    expect(mockData.exponats.mock.calls[0][0].name).toBe("vuk");
    expect(mockData.users.mock.calls[0][0].username).toBe("vuk");
    // the name/title alias wins over the specific parameter
    await run({ username: "ana", q: "birds" });
    expect(mockData.users.mock.calls[1][0].username).toBe("ana");
    expect(mockData.gbifWorks.mock.calls[1][0].q).toBe("birds");
  });

  it("forwards taxonomy, sorting and paging to the exponat search", async () => {
    await run({
      genus: "Vulpes",
      family: "Canidae",
      kingdom: "Animalia",
      phylum: "Chordata",
      order: "Carnivora",
      species: "Vulpes vulpes",
      class: "Mammalia",
      attribute: "name",
      direction: "asc",
      page: 3,
      minFavoriteCount: 2,
      organisationId: "o1",
    });
    expect(mockData.exponats.mock.calls[0][0]).toMatchObject({
      genus: "Vulpes",
      family: "Canidae",
      kingdom: "Animalia",
      phylum: "Chordata",
      order: "Carnivora",
      species: "Vulpes vulpes",
      class: "Mammalia",
      attribute: "name",
      direction: "asc",
      page: 3,
      minFavoriteCount: 2,
      organisationId: "o1",
    });
  });

  it("forwards literature filters to GBIF", async () => {
    await run({
      publisher: ["x"],
      source: ["y"],
      topics: "BIODIVERSITY",
      year: [2020],
      literatureType: "JOURNAL",
    });
    expect(mockData.gbifWorks.mock.calls[0][0]).toMatchObject({
      publisher: ["x"],
      source: ["y"],
      topics: "BIODIVERSITY",
      year: [2020],
      literatureType: "JOURNAL",
    });
  });
});

describe("FollowsPage", () => {
  it("shows followers and following and the requested tab", async () => {
    mockData.followers.mockResolvedValue([{ id: "f" }]);
    mockData.following.mockResolvedValue([{ id: "g" }]);
    const props = named(
      await FollowsPage({
        params: { userId: "u1" },
        searchParams: { tab: "Following" },
      }),
      "FollowsTable",
    );
    expect(mockData.followers).toHaveBeenCalledWith("u1");
    expect(mockData.following).toHaveBeenCalledWith("u1");
    expect(props).toMatchObject({
      followers: [{ id: "f" }],
      following: [{ id: "g" }],
      firstTab: "Following",
    });
  });

  it("falls back to empty lists when the API cannot be reached", async () => {
    const props = named(
      await FollowsPage({ params: { userId: "u1" } }),
      "FollowsTable",
    );
    expect(props).toMatchObject({ followers: [], following: [] });
  });
});

describe("ExponatPage", () => {
  it("shows the exponat", async () => {
    mockData.exponat.mockResolvedValue({
      id: "e1",
      name: "Lisica",
      video: "v",
      thirdDimensionalModel: "m",
    });
    const tree = await ExponatPage({ params: { exponatId: "e1" } });
    expect(named(tree, "ExponatModal").exponat).toMatchObject({ id: "e1" });
    expect(named(tree, "ExtrasExponatButton")).toMatchObject({
      video: "v",
      thirdDimensionalModel: "m",
    });
    expect(redirect).not.toHaveBeenCalled();
  });

  it("an exponat that is not public is sent to its admin page", async () => {
    mockData.exponat.mockResolvedValue(null);
    await ExponatPage({ params: { exponatId: "e9" } }).catch(() => {});
    expect(redirect).toHaveBeenCalledWith("/exponat/e9/admin");
  });
});

describe("UserPage", () => {
  const user = (over = {}) => ({
    id: "u1",
    savedLiterature: [{ literatureId: "l1" }, { literatureId: "l2" }],
    ...over,
  });

  it("shows the profile with the saved GBIF literature that could be loaded", async () => {
    mockData.user.mockResolvedValue(user());
    mockData.gbifWork
      .mockResolvedValueOnce({ id: "l1" })
      .mockResolvedValueOnce(undefined);
    const tree = await UserPage({ params: { userId: "u1" } });
    expect(named(tree, "UserCard").user.id).toBe("u1");
    expect(named(tree, "UserPageBody").savedLiterature).toEqual([{ id: "l1" }]);
  });

  // BUG: the saved literature is mapped *before* the null check, so an unknown
  // user (serverGetUser -> null) throws a TypeError (HTTP 500) instead of
  // rendering the "not found" page the component already has.
  it.failing("renders the not found page for an unknown user", async () => {
    mockData.user.mockResolvedValue(null);
    const tree = await UserPage({ params: { userId: "nope" } });
    expect(find(tree, "NotFound")).toBeTruthy();
  });
});

describe("OrganisationPage", () => {
  it("passes the organisation and its works to the body", async () => {
    mockData.organisation.mockResolvedValue({ id: "o1" });
    mockData.works.mockResolvedValue([{ id: "w1" }]);
    const tree = await OrganisationPage({ params: { organisationId: "o1" } });
    expect(mockData.works).toHaveBeenCalledWith({ organisationId: "o1" });
    expect(named(tree, "OrganisationBody")).toMatchObject({
      organisation: { id: "o1" },
      works: [{ id: "w1" }],
    });
  });

  it("works that could not be loaded become an empty list", async () => {
    mockData.organisation.mockResolvedValue({ id: "o1" });
    const tree = await OrganisationPage({ params: { organisationId: "o1" } });
    expect(named(tree, "OrganisationBody").works).toEqual([]);
  });

  // BUG: a missing or unapproved organisation (serverGetOrganisation -> null)
  // is handed to OrganisationBody, which cannot render it, instead of showing
  // a not found page.
  it.failing(
    "does not render the organisation body for an unknown organisation",
    async () => {
      mockData.organisation.mockResolvedValue(null);
      const tree = await OrganisationPage({
        params: { organisationId: "nope" },
      });
      expect(find(tree, "OrganisationBody")).toBeUndefined();
    },
  );
});
