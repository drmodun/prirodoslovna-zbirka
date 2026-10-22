import { waitFor } from "@testing-library/react";
import { renderHookWithClient } from "../../test-utils/render";

jest.mock("./shared", () => ({
  api: { get: jest.fn() },
  fileApi: {},
}));
import { api } from "./shared";
import { useCheckForCategorization } from "./useCheckForCategorization";
import { useDiscoverExponats } from "./useDiscoverExponats";
import { useDiscoverOrganisations } from "./useDiscoverOrganisations";
import { useDiscoverPosts } from "./useDiscoverPosts";
import { useGetAuthorshipInfo } from "./useGetAuthorshipInfo";
import { useGetBySerialNumber } from "./useGetBySerialNumber";
import { useGetClientExponat } from "./useGetClientExponat";
import { useGetClientPost } from "./useGetClientPost";
import { useGetClientWork } from "./useGetClientWork";
import { useGetExponatsForOrganisation } from "./useGetExponatsForOrganisation";
import { useGetFollowedOrganisations } from "./useGetFollowedOrganisations";
import { useGetFollowers } from "./useGetFollowers";
import { useGetFollowing } from "./useGetFollowing";
import { useGetMe } from "./useGetMe";
import { useGetMySavedLiterature } from "./useGetMySavedLiterature";
import { useGetMySavedWorks } from "./useGetMySavedWorks";
import { useGetNotifications } from "./useGetNotifications";
import { useGetApiTokens } from "./useGetApiTokens";
import { useGetApiTokenUsage } from "./useGetApiTokenUsage";

const get = api.get as jest.Mock;

describe("query hooks", () => {
  beforeEach(() => get.mockResolvedValue([{ id: "x" }]));

  it.each([
    [
      "useDiscoverExponats",
      () => useDiscoverExponats(2, 5),
      "/exponats/discover?page=2&size=5",
    ],
    [
      "useDiscoverOrganisations",
      () => useDiscoverOrganisations(2, 5),
      "/organisations/discover?page=2&size=5",
    ],
    [
      "useDiscoverPosts",
      () => useDiscoverPosts(2, 5),
      "/posts/discover?page=2&size=5",
    ],
    ["useGetClientExponat", () => useGetClientExponat("e1"), "/exponats/e1"],
    ["useGetClientPost", () => useGetClientPost("p1"), "/posts/p1"],
    ["useGetClientWork", () => useGetClientWork("w1"), "/works/w1"],
    ["useGetFollowers", () => useGetFollowers("u1"), "/follows/u1/followers"],
    ["useGetFollowing", () => useGetFollowing("u1"), "/follows/u1/following"],
    [
      "useGetAuthorshipInfo",
      () => useGetAuthorshipInfo("a1"),
      "/authorship-info/a1",
    ],
    [
      "useGetBySerialNumber",
      () => useGetBySerialNumber(12),
      "/exponats/serial/12",
    ],
    [
      "useCheckForCategorization",
      () => useCheckForCategorization("Vulpes"),
      "/categorizations/name/Vulpes",
    ],
    ["useGetApiTokens", () => useGetApiTokens(), "/auth/tokens"],
    [
      "useGetApiTokenUsage",
      () => useGetApiTokenUsage("t1"),
      "/auth/tokens/t1/usage",
    ],
  ])("%s requests %s", async (_n, hook, url) => {
    const { result } = renderHookWithClient(hook as () => any);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(get.mock.calls[0][0]).toBe(url);
    expect(result.current.data).toEqual([{ id: "x" }]);
  });

  it.each([
    ["useGetFollowers", () => useGetFollowers(undefined)],
    ["useGetFollowing", () => useGetFollowing(undefined)],
    [
      "useGetExponatsForOrganisation",
      () => useGetExponatsForOrganisation(undefined),
    ],
  ])("%s stays idle without an id", async (_n, hook) => {
    const { result } = renderHookWithClient(hook as () => any);
    await new Promise((r) => setTimeout(r, 20));
    expect(get).not.toHaveBeenCalled();
    expect(result.current.status).toBe("idle");
  });

  it("useGetExponatsForOrganisation filters by organisation", async () => {
    const { result } = renderHookWithClient(() =>
      useGetExponatsForOrganisation("o1"),
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(get).toHaveBeenCalledWith("/exponats", {
      params: { organisationId: "o1" },
    });
  });

  describe("logged-in only queries", () => {
    const authed: [string, () => any, string][] = [
      ["useGetMe", useGetMe, "/auth/detailed"],
      ["useGetNotifications", useGetNotifications, "/notification-users"],
      ["useGetMySavedWorks", useGetMySavedWorks, "/saved-works/me"],
      ["useGetMySavedLiterature", useGetMySavedLiterature, "/literature/me"],
      [
        "useGetFollowedOrganisations",
        useGetFollowedOrganisations,
        "/favourite-organisations/user",
      ],
    ];

    it.each(authed)(
      "%s fetches %s when a token is stored",
      async (_n, hook, url) => {
        localStorage.setItem("access_token", "tok");
        const { result } = renderHookWithClient(hook);
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(get.mock.calls[0][0]).toBe(url);
      },
    );

    it.each(authed)(
      "%s does not call the API without a token",
      async (_n, hook) => {
        const { result } = renderHookWithClient(hook);
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(get).not.toHaveBeenCalled();
      },
    );
  });

  it("useGetMe clears the session and redirects to /login when the token is rejected", async () => {
    localStorage.setItem("access_token", "stale");
    localStorage.setItem("loggedTime", "now");
    get.mockRejectedValue("Unauthorized");
    const assign = jest.fn();
    const original = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...original,
        set href(v: string) {
          assign(v);
        },
      },
    });

    const { result } = renderHookWithClient(useGetMe);
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("loggedTime")).toBeNull();
    expect(assign).toHaveBeenCalledWith("/login");
    Object.defineProperty(window, "location", {
      configurable: true,
      value: original,
    });
  });
});
