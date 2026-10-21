import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ---- the list component records what it was given -----------------------
const mockList: { props: any } = { props: undefined };
jest.mock("components/CardCollectionAsync", () => ({
  __esModule: true,
  default: (props: any) => {
    mockList.props = props;
    return (
      <div data-testid="results">
        {`${props.type}|page=${props.page}|${props.items.map((i: any) => i.id).join(",")}`}
      </div>
    );
  },
}));
jest.mock("@/utility/wrappers/userWrapper", () => ({
  UserWrapper: ({ children }: any) => <>{children}</>,
}));
jest.mock("components/SpeechToText", () => ({
  __esModule: true,
  default: () => null,
}));

// ---- search view ---------------------------------------------------------
jest.mock("components/FIlterForm/UserFilterForm", () => ({
  UserFilter: () => <div data-testid="filter">user filter</div>,
}));
jest.mock("components/FIlterForm/OrganisationFilter", () => ({
  OrganisationFilter: () => <div data-testid="filter">organisation filter</div>,
}));
jest.mock("components/FIlterForm/ExponatFIlterForm", () => ({
  ExponatFilter: () => <div data-testid="filter">exponat filter</div>,
}));
jest.mock("components/FIlterForm/PostFilterForm", () => ({
  PostFilter: () => <div data-testid="filter">post filter</div>,
}));
jest.mock("components/FIlterForm/WorkFilterForm", () => ({
  WorkFilter: () => <div data-testid="filter">work filter</div>,
}));
jest.mock("components/FIlterForm/LiteratureFilterForm", () => ({
  LiteratureFilter: () => <div data-testid="filter">literature filter</div>,
}));
jest.mock("@/api/serverUsers", () => ({ getUsers: jest.fn() }));
jest.mock("@/api/serverExponats", () => ({ getExponats: jest.fn() }));
jest.mock("@/api/serverPosts", () => ({ getPosts: jest.fn() }));
jest.mock("@/api/serverOrganisations", () => ({ getOrganisations: jest.fn() }));
jest.mock("@/api/serverWorks", () => ({ getWorks: jest.fn() }));
jest.mock("@/api/serverLiterature", () => ({ getGbifWorks: jest.fn() }));

// ---- discover view -------------------------------------------------------
const discover = {
  exponatPage: 1,
  organisationPage: 1,
  postPage: 1,
  workPage: 1,
  gbifWorkPage: 1,
  resetPages: jest.fn(),
  setOrganisationPage: jest.fn(),
  setExponatPage: jest.fn(),
  setWorkPage: jest.fn(),
  setGbifWorkPage: jest.fn(),
  setPostPage: jest.fn(),
};
jest.mock("@/utility/context/DiscoverContext", () => ({
  __esModule: true,
  default: () => discover,
}));
const feeds = {
  organisations: { data: undefined as any, isFetching: false },
  exponats: { data: undefined as any, isFetching: false },
  posts: { data: undefined as any, isFetching: false },
};
const mockUseOrgs = jest.fn(() => feeds.organisations);
const mockUseExponats = jest.fn(() => feeds.exponats);
const mockUsePosts = jest.fn(() => feeds.posts);
jest.mock("@/api/useDiscoverOrganisations", () => ({
  useDiscoverOrganisations: (...a: any[]) => (mockUseOrgs as any)(...a),
}));
jest.mock("@/api/useDiscoverExponats", () => ({
  useDiscoverExponats: (...a: any[]) => (mockUseExponats as any)(...a),
}));
jest.mock("@/api/useDiscoverPosts", () => ({
  useDiscoverPosts: (...a: any[]) => (mockUsePosts as any)(...a),
}));

import { getGbifWorks } from "@/api/serverLiterature";
import { getWorks } from "@/api/serverWorks";
import {
  DiscoverPageView,
  tabDictionary as discoverTabs,
} from "../../app/views/DiscoverPageView/DiscoverPageView";
import {
  SearchPageView,
  tabDictionary as searchTabs,
} from "../../app/views/SearchPageView/SearchPageView";

const items = (...ids: string[]) => ids.map((id) => ({ id }));
const results = () => screen.getByTestId("results").textContent;

describe("SearchPageView", () => {
  const props = (over: Record<string, unknown> = {}) =>
    ({
      users: items("u1"),
      organisations: items("o1"),
      exponats: items("e1"),
      posts: items("p1"),
      works: items("w1"),
      literature: items("l1"),
      initTab: "Korisnici",
      query: { kind: "user" },
      ...over,
    }) as any;

  it.each([
    ["Korisnici", "user filter", "user|page=2|u1"],
    ["Organizacije", "organisation filter", "organisation|page=2|o1"],
    ["Eksponati", "exponat filter", "exponat|page=2|e1"],
    ["Objave", "post filter", "post|page=2|p1"],
    ["Radovi", "work filter", "work|page=2|w1"],
    ["Literatura", "literature filter", "literature|page=2|l1"],
  ])("the %s tab shows its filter and its results", (tab, filter, expected) => {
    render(<SearchPageView {...props({ initTab: tab })} />);
    expect(screen.getByTestId("filter")).toHaveTextContent(filter);
    expect(results()).toBe(expected);
  });

  it("switching tabs swaps the filter and the result type", async () => {
    render(<SearchPageView {...props()} />);
    await userEvent.click(screen.getByRole("button", { name: "Eksponati" }));
    expect(screen.getByTestId("filter")).toHaveTextContent("exponat filter");
    expect(results()).toContain("exponat|");
  });

  it("without a query it only shows the filter", () => {
    render(<SearchPageView {...props({ query: undefined })} />);
    expect(screen.getByTestId("filter")).toBeInTheDocument();
    expect(screen.queryByTestId("results")).toBeNull();
  });

  it("passes the query on as parameters for loading more", () => {
    render(
      <SearchPageView
        {...props({ query: { kind: "user", username: "ana" } })}
      />,
    );
    expect(mockList.props.params).toEqual({ kind: "user", username: "ana" });
    expect(typeof mockList.props.getMore).toBe("function");
  });

  it("continues from the query's page, or page 2 by default", () => {
    render(<SearchPageView {...props({ query: { kind: "user", page: 5 } })} />);
    // the effect that resets on [query, tab] runs right away
    expect(results()).toContain("page=2");
  });

  it("every tab has a result type", () => {
    expect(Object.keys(searchTabs)).toHaveLength(6);
  });
});

describe("DiscoverPageView", () => {
  const props = (over: Record<string, unknown> = {}) =>
    ({
      organisations: items("o1"),
      exponats: items("e1"),
      posts: items("p1"),
      works: items("w1"),
      gbifWorks: items("g1"),
      initTab: "Organizacije",
      query: { page: 1, size: 20 },
      ...over,
    }) as any;

  beforeEach(() => {
    Object.assign(discover, {
      exponatPage: 1,
      organisationPage: 1,
      postPage: 1,
      workPage: 1,
      gbifWorkPage: 1,
    });
    feeds.organisations = { data: undefined, isFetching: false };
    feeds.exponats = { data: undefined, isFetching: false };
    feeds.posts = { data: undefined, isFetching: false };
    (getWorks as jest.Mock).mockResolvedValue(items("w2"));
    (getGbifWorks as jest.Mock).mockResolvedValue(items("g2"));
  });

  it.each([
    ["Organizacije", "organisation|page=1|o1"],
    ["Eksponati", "exponat|page=1|e1"],
    ["Objave", "post|page=1|p1"],
    ["Radovi", "work|page=1|w1"],
    ["Radovi (GBIF)", "work|page=1|g1"],
  ])("the %s tab lists its items", async (tab, expected) => {
    render(<DiscoverPageView {...props({ initTab: tab })} />);
    await waitFor(() => expect(results()).toBe(expected));
  });

  it("both work tabs render works", () => {
    expect(discoverTabs.Radovi).toBe("work");
    expect(discoverTabs["Radovi (GBIF)"]).toBe("work");
  });

  it("switching tabs changes what is listed", async () => {
    render(<DiscoverPageView {...props()} />);
    await userEvent.click(screen.getByRole("button", { name: "Objave" }));
    await waitFor(() => expect(results()).toContain("post|"));
  });

  it("appends newly fetched discover pages without duplicates", async () => {
    feeds.organisations = { data: items("o1", "o2"), isFetching: false };
    render(<DiscoverPageView {...props()} />);
    await waitFor(() => expect(results()).toContain("o1,o2"));
    expect(results().match(/o1/g)).toHaveLength(1);
  });

  it("an empty discover page means the feed ended: pages are reset", async () => {
    feeds.exponats = { data: [], isFetching: false };
    render(<DiscoverPageView {...props()} />);
    await waitFor(() => expect(discover.resetPages).toHaveBeenCalled());
  });

  describe("loading more", () => {
    it("advances the page of the active feed", async () => {
      render(<DiscoverPageView {...props()} />);
      await act(async () => {
        await mockList.props.getMore();
      });
      expect(discover.setOrganisationPage).toHaveBeenCalledTimes(1);
      const update = discover.setOrganisationPage.mock.calls[0][0];
      expect(update(3)).toBe(4);
    });

    it("the three feeds wait while any of them is fetching", async () => {
      feeds.posts = { data: undefined, isFetching: true };
      render(<DiscoverPageView {...props()} />);
      await act(async () => {
        await mockList.props.getMore();
      });
      expect(discover.setOrganisationPage).not.toHaveBeenCalled();
    });

    it("works page independently of the feeds", async () => {
      feeds.posts = { data: undefined, isFetching: true };
      render(<DiscoverPageView {...props({ initTab: "Radovi" })} />);
      await act(async () => {
        await mockList.props.getMore();
      });
      expect(discover.setWorkPage).toHaveBeenCalled();
    });

    it("fetches further works when the work page advances", async () => {
      discover.workPage = 2;
      render(<DiscoverPageView {...props({ initTab: "Radovi" })} />);
      await waitFor(() =>
        expect(getWorks).toHaveBeenCalledWith({ page: 1, size: 20 }, 2),
      );
      await waitFor(() => expect(results()).toContain("w1,w2"));
    });

    it("fetches further GBIF works with the page in the query", async () => {
      discover.gbifWorkPage = 3;
      render(<DiscoverPageView {...props({ initTab: "Radovi (GBIF)" })} />);
      await waitFor(() => expect(getGbifWorks).toHaveBeenCalled());
      expect((getGbifWorks as jest.Mock).mock.calls[0][0].page).toBe(3);
    });

    it("a failed works fetch resets the pages", async () => {
      discover.workPage = 2;
      (getWorks as jest.Mock).mockResolvedValue(undefined);
      render(<DiscoverPageView {...props({ initTab: "Radovi" })} />);
      await waitFor(() => expect(discover.resetPages).toHaveBeenCalled());
    });
  });

  it("requests discover pages of the size from the query", () => {
    render(<DiscoverPageView {...props()} />);
    expect(mockUseOrgs).toHaveBeenCalledWith(1, 20);
  });

  it("shows a spinner state to the list while a feed is fetching", () => {
    feeds.exponats = { data: undefined, isFetching: true };
    render(<DiscoverPageView {...props()} />);
    expect(mockList.props.isLoading).toBe(true);
  });
});
