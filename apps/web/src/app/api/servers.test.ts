jest.mock("./getUrlServer", () => ({
  apiFetch: jest.fn(),
  filesUrl: "http://files.test",
}));
import { apiFetch } from "./getUrlServer";
import { discoverExponats, getExponats } from "./serverExponats";
import { serverGetExponat } from "./serverExponat";
import { getUserFollowers, getUserFollowing } from "./serverFollows";
import { discoverOrganisations, getOrganisations } from "./serverOrganisations";
import { serverGetOrganisation } from "./serverOrganisation";
import { discoverPosts, getPosts } from "./serverPosts";
import { serverGetPost } from "./serverPost";
import { getUsers } from "./serverUsers";
import { serverGetUser } from "./serverUser";
import { getWork } from "./serverWork";
import { getWorks, WorkToGbifQueryMapper } from "./serverWorks";

const fetchMock = apiFetch as jest.Mock;
const respond = (body: unknown, status = 200) =>
  fetchMock.mockResolvedValue({
    status,
    ok: status < 400,
    json: async () => body,
  });

describe("single entity fetchers", () => {
  it.each([
    ["serverGetUser", serverGetUser, ["users", "7"]],
    ["serverGetExponat", serverGetExponat, ["exponats", "7"]],
    ["serverGetOrganisation", serverGetOrganisation, ["organisations", "7"]],
    ["serverGetPost", serverGetPost, ["posts", "7"]],
    ["getWork", getWork, ["works", "7"]],
  ] as const)("%s requests %j without caching", async (_n, fn, segments) => {
    respond({ id: "7" });
    await expect(fn("7")).resolves.toEqual({ id: "7" });
    expect(fetchMock).toHaveBeenCalledWith([...segments], {
      cache: "no-store",
    });
  });

  it.each([
    ["serverGetUser", serverGetUser],
    ["serverGetExponat", serverGetExponat],
    ["serverGetOrganisation", serverGetOrganisation],
    ["serverGetPost", serverGetPost],
    ["getWork", getWork],
  ] as const)(
    "%s returns null for a 404 so the page can call notFound()",
    async (_n, fn) => {
      respond({}, 404);
      await expect(fn("7")).resolves.toBeNull();
    },
  );

  it.each([
    ["serverGetUser", serverGetUser],
    ["serverGetExponat", serverGetExponat],
    ["serverGetOrganisation", serverGetOrganisation],
    ["serverGetPost", serverGetPost],
    ["getWork", getWork],
    ["getUserFollowers", getUserFollowers],
    ["getUserFollowing", getUserFollowing],
  ] as const)("%s survives a network failure (undefined)", async (_n, fn) => {
    fetchMock.mockRejectedValue(new Error("down"));
    await expect(fn("7")).resolves.toBeUndefined();
  });
});

describe("followers", () => {
  it("fetches both directions", async () => {
    respond([{ id: "a" }]);
    await expect(getUserFollowers("u1")).resolves.toEqual([{ id: "a" }]);
    await getUserFollowing("u1");
    expect(fetchMock.mock.calls[0][0]).toEqual(["follows", "u1", "followers"]);
    expect(fetchMock.mock.calls[1][0]).toEqual(["follows", "u1", "following"]);
  });
});

describe("list fetchers", () => {
  const query = () => fetchMock.mock.calls[0][1].query as string;

  it("getExponats: maps title to name, keeps allowed sorting, paginates", async () => {
    respond([]);
    await getExponats({ title: "lisica", attribute: "favourites" } as any, 3);
    expect(fetchMock.mock.calls[0][0]).toEqual(["exponats"]);
    expect(query()).toBe(
      "attribute=favourites&name=lisica&page=3&size=20&title=lisica",
    );
  });

  it("getExponats: drops sort attributes the API does not accept", async () => {
    respond([]);
    await getExponats({ attribute: "password" } as any);
    expect(query()).not.toContain("attribute");
  });

  it("getUsers: the generic `name` sort becomes `username`", async () => {
    respond([]);
    await getUsers({ attribute: "name", title: "ana" } as any);
    expect(fetchMock.mock.calls[0][0]).toEqual(["users"]);
    expect(query()).toContain("attribute=username");
    expect(query()).toContain("name=ana");
  });

  it("getOrganisations: maps title to name", async () => {
    respond([]);
    await getOrganisations({ title: "muzej" } as any, 2);
    expect(fetchMock.mock.calls[0][0]).toEqual(["organisations"]);
    expect(query()).toContain("name=muzej");
    expect(query()).toContain("page=2");
  });

  it("getPosts: maps name to title and `name` sort to the title sort", async () => {
    respond([]);
    await getPosts({ name: "lisica", attribute: "name" } as any);
    expect(query()).toContain("title=lisica");
    expect(query()).toContain("attribute=title");
  });

  it("getWorks: starts on page 1 and maps the name sort to title", async () => {
    respond([]);
    await getWorks({ attribute: "name" } as any);
    expect(fetchMock.mock.calls[0][0]).toEqual(["works"]);
    expect(query()).toContain("attribute=title");
    expect(query()).toContain("page=1");
  });

  it.each([
    ["getExponats", (q: any) => getExponats(q)],
    ["getUsers", (q: any) => getUsers(q)],
    ["getOrganisations", (q: any) => getOrganisations(q)],
    ["getPosts", (q: any) => getPosts(q)],
    ["getWorks", (q: any) => getWorks(q)],
  ])("%s returns undefined when the API cannot be reached", async (_n, fn) => {
    fetchMock.mockRejectedValue(new Error("down"));
    await expect(fn({})).resolves.toBeUndefined();
  });

  it.each([
    ["exponats", discoverExponats],
    ["organisations", discoverOrganisations],
    ["posts", discoverPosts],
  ] as const)("discover %s", async (resource, fn) => {
    respond([{ id: 1 }]);
    await expect(fn({ page: 1, size: 8 })).resolves.toEqual([{ id: 1 }]);
    expect(fetchMock).toHaveBeenCalledWith([resource, "discover"], {
      query: "page=1&size=8",
      cache: "no-store",
    });
  });
});

describe("WorkToGbifQueryMapper", () => {
  it("maps the filter and computes the offset", () => {
    expect(
      WorkToGbifQueryMapper({
        title: "bears",
        type: "JOURNAL",
        organisationId: "o1",
        page: 3,
        size: 10,
        tags: ["BIODIVERSITY"],
      } as any),
    ).toMatchObject({
      q: "bears",
      literatureType: "JOURNAL",
      publisher: ["o1"],
      limit: 10,
      offset: 20,
    });
  });

  it("defaults to GBIF as publisher, 20 results and offset 0", () => {
    expect(WorkToGbifQueryMapper({} as any)).toMatchObject({
      publisher: ["GBIF"],
      limit: 20,
      offset: 0,
    });
  });
});
