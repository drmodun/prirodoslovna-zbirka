import { AxiosError, AxiosRequestConfig } from "axios";
import toast from "react-hot-toast";
import { api, baseURL, fileApi } from "./shared";

const respondWith =
  (result: { status: number; data?: unknown }) => async (config: any) => {
    if (result.status >= 400) {
      throw new AxiosError(
        "Request failed",
        "ERR_BAD_REQUEST",
        config,
        {},
        {
          status: result.status,
          data: result.data,
          statusText: "",
          headers: {},
          config,
        },
      );
    }
    return {
      data: result.data,
      status: result.status,
      statusText: "OK",
      headers: {},
      config,
    };
  };

describe("api client", () => {
  const original = api.defaults.adapter;
  afterEach(() => {
    api.defaults.adapter = original;
  });

  it("is configured with the public API address, JSON and a timeout", () => {
    expect(api.defaults.baseURL).toBe(baseURL);
    expect(fileApi.defaults.baseURL).toBe(baseURL);
    expect(api.defaults.headers["Content-Type"]).toBe("application/json");
    expect(api.defaults.timeout).toBe(5000);
  });

  it("sends the stored token as a bearer header", async () => {
    localStorage.setItem("access_token", "tok");
    let seen: AxiosRequestConfig | undefined;
    api.defaults.adapter = async (config: any) => {
      seen = config;
      return respondWith({ status: 200, data: {} })(config);
    };
    await api.get("/auth/me");
    expect(seen?.headers?.Authorization).toBe("Bearer tok");
  });

  it("sends the stored token with uploads too", async () => {
    localStorage.setItem("access_token", "tok");
    const fileAdapter = fileApi.defaults.adapter;
    let seen: AxiosRequestConfig | undefined;
    fileApi.defaults.adapter = async (config: any) => {
      seen = config;
      return respondWith({ status: 201, data: "url" })(config);
    };
    await fileApi.post("/blobs/exponat", new FormData());
    fileApi.defaults.adapter = fileAdapter;
    expect(seen?.headers?.Authorization).toBe("Bearer tok");
  });

  it("sends no Authorization header without a token", async () => {
    let seen: AxiosRequestConfig | undefined;
    api.defaults.adapter = async (config: any) => {
      seen = config;
      return respondWith({ status: 200, data: {} })(config);
    };
    await api.get("/exponats");
    expect(seen?.headers?.Authorization).toBeUndefined();
  });

  it("asks for answers in the language of the interface", async () => {
    const seen: (string | undefined)[] = [];
    api.defaults.adapter = async (config: any) => {
      seen.push(config.headers["Accept-Language"]);
      return respondWith({ status: 200, data: {} })(config);
    };
    await api.get("/x");
    document.cookie = "NEXT_LOCALE=hr; path=/";
    await api.get("/x");
    document.cookie = "NEXT_LOCALE=; path=/; max-age=0";
    expect(seen).toEqual(["en", "hr"]);
  });

  it("resolves with the response body, not the axios response", async () => {
    api.defaults.adapter = respondWith({ status: 200, data: { id: 1 } });
    await expect(api.get("/x")).resolves.toEqual({ id: 1 });
  });

  it("rejects with the server's message", async () => {
    api.defaults.adapter = respondWith({
      status: 400,
      data: { message: "Invalid credentials" },
    });
    await expect(api.post("/auth/login")).rejects.toBe("Invalid credentials");
  });

  it("falls back to the axios message when the body has none", async () => {
    api.defaults.adapter = respondWith({ status: 500, data: {} });
    await expect(api.get("/x")).rejects.toBe("Request failed");
  });

  it("shows a toast for 401 responses", async () => {
    api.defaults.adapter = respondWith({
      status: 401,
      data: { message: "Unauthorized" },
    });
    await expect(api.get("/auth/me")).rejects.toBe("Unauthorized");
    expect(toast.error).toHaveBeenCalledWith("Unauthorized");
  });

  it("does not toast for other errors", async () => {
    api.defaults.adapter = respondWith({
      status: 404,
      data: { message: "Not found" },
    });
    await expect(api.get("/x")).rejects.toBe("Not found");
    expect(toast.error).not.toHaveBeenCalled();
  });
});
