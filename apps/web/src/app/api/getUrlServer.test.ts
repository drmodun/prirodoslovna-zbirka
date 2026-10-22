/** The module reads process.env when it is imported, so load it per case. */
const load = (env: Record<string, string | undefined>) => {
  jest.resetModules();
  for (const key of [
    "NEXT_PUBLIC_API_URL",
    "NEXT_PUBLIC_WEB_URL",
    "NEXT_PUBLIC_FILES_URL",
    "API_INTERNAL_URL",
  ])
    delete process.env[key];
  Object.assign(process.env, env);
  return require("./getUrlServer") as typeof import("./getUrlServer");
};

describe("publicApiUrl", () => {
  it("defaults to the local API", () => {
    expect(load({}).publicApiUrl).toBe("http://localhost:5500");
  });

  it("prefers NEXT_PUBLIC_API_URL", () => {
    expect(
      load({
        NEXT_PUBLIC_API_URL: "https://api.example.hr",
        NEXT_PUBLIC_WEB_URL: "https://web.example.hr",
      }).publicApiUrl,
    ).toBe("https://api.example.hr");
  });

  it("serves the API at /api behind a configured web address", () => {
    expect(
      load({ NEXT_PUBLIC_WEB_URL: "https://web.example.hr" }).publicApiUrl,
    ).toBe("https://web.example.hr/api");
  });

  it("keeps a same-origin path, as the Docker images are built", () => {
    expect(load({ NEXT_PUBLIC_API_URL: "/api" }).publicApiUrl).toBe("/api");
  });

  it("ignores the default local web address", () => {
    expect(
      load({ NEXT_PUBLIC_WEB_URL: "http://localhost:3000" }).publicApiUrl,
    ).toBe("http://localhost:5500");
  });
});

describe("filesUrl", () => {
  it("defaults to the public bucket and can be overridden", () => {
    expect(load({}).filesUrl).toContain("s3");
    expect(load({ NEXT_PUBLIC_FILES_URL: "http://files.test" }).filesUrl).toBe(
      "http://files.test",
    );
  });
});

describe("getBaseUrl", () => {
  it("uses the public address in the browser (jsdom has a window)", () => {
    const m = load({
      NEXT_PUBLIC_API_URL: "https://api.example.hr",
      API_INTERNAL_URL: "http://api:5500",
    });
    expect(m.getBaseUrl()).toBe("https://api.example.hr");
  });

  describe("on the server", () => {
    const realWindow = global.window;
    beforeEach(() => {
      // @ts-expect-error simulate the server render environment
      delete global.window;
    });
    afterEach(() => {
      global.window = realWindow;
    });

    it("prefers the private API_INTERNAL_URL", () => {
      const m = load({
        NEXT_PUBLIC_API_URL: "https://api.example.hr",
        API_INTERNAL_URL: "http://api:5500",
      });
      expect(m.getBaseUrl()).toBe("http://api:5500");
    });

    it("falls back to the public address", () => {
      const m = load({ NEXT_PUBLIC_API_URL: "https://api.example.hr" });
      expect(m.getBaseUrl()).toBe("https://api.example.hr");
    });
  });
});

describe("apiFetch", () => {
  let fetchMock: jest.Mock;
  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock as unknown as typeof fetch;
  });
  const api = () => load({ NEXT_PUBLIC_API_URL: "http://api.test" });

  it("builds the address from encoded path parts and the query", async () => {
    await api().apiFetch(["exponats", "a b"], { query: "page=2&size=20" });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/exponats/a%20b?page=2&size=20",
      {},
    );
  });

  it("passes the remaining request options through", async () => {
    await api().apiFetch(["users"], { cache: "no-store", method: "POST" });
    expect(fetchMock).toHaveBeenCalledWith("http://api.test/users", {
      cache: "no-store",
      method: "POST",
    });
  });

  it.each([
    ["../users", "http://api.test/users/..%2Fusers"],
    ["//evil.example", "http://api.test/users/%2F%2Fevil.example"],
    ["a/b?c#d", "http://api.test/users/a%2Fb%3Fc%23d"],
  ])("keeps %p a single path segment", async (id, expected) => {
    await api().apiFetch(["users", id]);
    expect(fetchMock.mock.calls[0][0]).toBe(expected);
  });

  it("accepts numeric segments and omits an empty query", async () => {
    await api().apiFetch(["exponats", 12], { query: "" });
    expect(fetchMock.mock.calls[0][0]).toBe("http://api.test/exponats/12");
  });
});

export {};
