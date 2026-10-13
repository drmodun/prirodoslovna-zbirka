import { buildListQuery, fetchDiscover } from "./listQuery";

jest.mock("./getUrlServer", () => ({ apiFetch: jest.fn() }));
import { apiFetch } from "./getUrlServer";

describe("buildListQuery", () => {
  const sortable = ["name", "createdAt"] as const;

  it("keeps a sortable attribute and sets page 1 and size 20 by default", () => {
    const query = buildListQuery({ attribute: "name" }, sortable);
    expect(query).toBe("attribute=name&page=1&size=20");
  });

  it("drops attributes that are not sortable", () => {
    const dto = { attribute: "password" };
    expect(buildListQuery(dto, sortable)).toBe("page=1&size=20");
    expect(dto).not.toHaveProperty("attribute");
  });

  it("an explicit page wins over the one in the dto", () => {
    expect(buildListQuery({ page: 2 }, sortable, 5)).toContain("page=5");
  });

  it("keeps the page of the dto without an explicit one", () => {
    expect(buildListQuery({ page: 3 }, sortable)).toContain("page=3");
  });

  it("always forces the page size", () => {
    expect(buildListQuery({ size: 500 }, sortable)).toContain("size=20");
  });

  it("mutates the dto so the next page can reuse it", () => {
    const dto: any = {};
    buildListQuery(dto, sortable, 2);
    expect(dto).toMatchObject({ page: 2, size: 20 });
  });

  it("serialises other filters in sorted key order", () => {
    const query = buildListQuery({ title: "lisica", page: 1 } as any, sortable);
    expect(query).toBe("page=1&size=20&title=lisica");
  });
});

describe("fetchDiscover", () => {
  it("requests <resource>/discover without caching", async () => {
    (apiFetch as jest.Mock).mockResolvedValue({
      json: async () => [{ id: 1 }],
    });
    await expect(fetchDiscover("posts", { page: 2, size: 5 })).resolves.toEqual(
      [{ id: 1 }],
    );
    expect(apiFetch).toHaveBeenCalledWith(["posts", "discover"], {
      query: "page=2&size=5",
      cache: "no-store",
    });
  });

  it("falls back to page 1 and size 20", async () => {
    (apiFetch as jest.Mock).mockResolvedValue({ json: async () => [] });
    await fetchDiscover("posts", { page: 0, size: 0 });
    expect((apiFetch as jest.Mock).mock.calls[0][1].query).toBe(
      "page=1&size=20",
    );
  });

  it("swallows network errors and returns undefined", async () => {
    (apiFetch as jest.Mock).mockRejectedValue(new Error("down"));
    await expect(
      fetchDiscover("posts", { page: 1, size: 1 }),
    ).resolves.toBeUndefined();
  });
});
