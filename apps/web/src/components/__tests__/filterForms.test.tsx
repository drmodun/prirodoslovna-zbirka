import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("components/SpeechToText", () => ({
  __esModule: true,
  default: () => null,
}));
const mockTaxonomy = jest.fn();
jest.mock("@/api/useGetTaxonomyEntities", () => ({
  useGetTaxonomyEntities: (...args: unknown[]) => mockTaxonomy(...args),
}));

import {
  RELEVANCE,
  buildSearchQuery,
  refineSortPair,
} from "../FIlterForm/shared";
import { ExponatFilter } from "../FIlterForm/ExponatFIlterForm";
import { OrganisationFilter } from "../FIlterForm/OrganisationFilter";
import { PostFilter } from "../FIlterForm/PostFilterForm";
import { UserFilter } from "../FIlterForm/UserFilterForm";
import { WorkFilter } from "../FIlterForm/WorkFilterForm";

/** The query of the "Pretraži" link as a plain object. */
const searchQuery = () => {
  const href = screen.getByRole("link").getAttribute("href")!;
  const url = new URL(href, "http://x");
  expect(url.pathname).toBe("/search");
  return Object.fromEntries(url.searchParams.entries());
};

beforeEach(() => {
  mockTaxonomy.mockReturnValue({ data: undefined });
});

describe("buildSearchQuery", () => {
  it("always carries the kind", () => {
    expect(buildSearchQuery("post", {}, ["title"])).toEqual({ kind: "post" });
  });

  it("includes only the fields that have a value", () => {
    expect(
      buildSearchQuery("post", { title: "lisica", userName: "" }, [
        "title",
        "userName",
      ]),
    ).toEqual({ kind: "post", title: "lisica" });
  });

  it("renames form fields to URL parameters", () => {
    expect(
      buildSearchQuery(
        "exponat",
        { alternateName: "Vulpes" },
        ["alternateName"],
        {
          alternateName: "search",
        },
      ),
    ).toEqual({ kind: "exponat", search: "Vulpes" });
  });

  it("leaves sorting out when sorting by relevance", () => {
    expect(
      buildSearchQuery("post", { attribute: RELEVANCE, direction: "desc" }, []),
    ).toEqual({ kind: "post" });
  });

  it("adds attribute and direction for explicit sorting", () => {
    expect(
      buildSearchQuery("post", { attribute: "title", direction: "asc" }, []),
    ).toEqual({ kind: "post", attribute: "title", direction: "asc" });
  });
});

describe("refineSortPair", () => {
  it.each([
    [{ attribute: "name" }, false],
    [{ direction: "asc" }, false],
  ])("rejects a lone attribute or direction (%j)", (data, expected) => {
    expect(refineSortPair(data)).toBe(expected);
  });

  it.each([[{ attribute: "name", direction: "asc" }], [{}]])(
    "accepts a complete or empty pair (%j)",
    (data) => {
      expect(refineSortPair(data)).toBe(true);
    },
  );
});

describe("UserFilter", () => {
  it("starts with the search params from the URL", () => {
    render(
      <UserFilter searchParams={{ username: "ana", location: "ISTARSKA" }} />,
    );
    expect(screen.getByPlaceholderText("Korisničko ime")).toHaveValue("ana");
    expect(searchQuery()).toMatchObject({
      kind: "user",
      username: "ana",
      location: "ISTARSKA",
    });
  });

  it("accepts the generic `name` or `title` param as a username", () => {
    render(<UserFilter searchParams={{ title: "ivo" }} />);
    expect(screen.getByPlaceholderText("Korisničko ime")).toHaveValue("ivo");
  });

  it("updates the search link while typing", async () => {
    render(<UserFilter />);
    await userEvent.type(screen.getByPlaceholderText("Korisničko ime"), "eva");
    await waitFor(() => expect(searchQuery().username).toBe("eva"));
  });

  it("includes the chosen sorting, but not the relevance default", async () => {
    render(<UserFilter />);
    expect(searchQuery()).not.toHaveProperty("attribute");
    const [attribute, direction] = screen.getAllByRole("combobox").slice(1);
    await userEvent.selectOptions(attribute, "points");
    await userEvent.selectOptions(direction, "asc");
    await waitFor(() =>
      expect(searchQuery()).toMatchObject({
        attribute: "points",
        direction: "asc",
      }),
    );
  });

  it("offers the counties by their Croatian names", () => {
    render(<UserFilter />);
    expect(
      screen.getByRole("option", { name: "Grad Zagreb" }),
    ).toBeInTheDocument();
  });
});

describe("PostFilter", () => {
  it("builds the post search from title, author and exponat", async () => {
    render(<PostFilter searchParams={{ title: "lisica" }} />);
    expect(screen.getByPlaceholderText("Naziv")).toHaveValue("lisica");
    await userEvent.type(screen.getByPlaceholderText("Ime autora"), "Ana");
    await waitFor(() =>
      expect(searchQuery()).toMatchObject({ kind: "post", title: "lisica" }),
    );
  });
});

describe("OrganisationFilter", () => {
  it("builds the organisation search", async () => {
    render(<OrganisationFilter searchParams={{ name: "muzej" }} />);
    expect(screen.getByPlaceholderText("Naziv")).toHaveValue("muzej");
    expect(searchQuery()).toMatchObject({ kind: "organisation" });
  });
});

describe("WorkFilter", () => {
  it("builds the work search with tags", async () => {
    render(<WorkFilter searchParams={{ title: "flora" }} />);
    expect(screen.getByPlaceholderText("Naziv")).toHaveValue("flora");
    expect(searchQuery()).toMatchObject({ kind: "work" });
  });
});

describe("ExponatFilter", () => {
  const species = (names: string[]) => ({
    data: names.map((name, i) => ({ scientificName: name, nubKey: 100 + i })),
  });

  it("searches exponats by name and alternate name", async () => {
    render(
      <ExponatFilter searchParams={{ name: "lisica", search: "Vulpes" }} />,
    );
    expect(searchQuery()).toMatchObject({
      kind: "exponat",
      name: "lisica",
      search: "Vulpes", // alternateName travels as `search`
    });
  });

  it("offers a dropdown for each taxonomic rank, fed by GBIF suggestions", () => {
    mockTaxonomy.mockImplementation((_s: string, rank: string) =>
      rank === "KINGDOM"
        ? species(["Animalia", "Plantae"])
        : { data: undefined },
    );
    render(<ExponatFilter />);
    expect(
      screen.getByPlaceholderText("Izaberi kraljevstvo"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Izaberi koljeno")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Izaberi vrstu")).toBeInTheDocument();
    expect(screen.getByText("Animalia")).toBeInTheDocument();
  });

  it("narrows the phylum suggestions by the chosen kingdom's GBIF key", async () => {
    mockTaxonomy.mockImplementation((_s: string, rank: string) =>
      rank === "KINGDOM" ? species(["Animalia"]) : { data: undefined },
    );
    render(<ExponatFilter />);
    await userEvent.click(screen.getByPlaceholderText("Izaberi kraljevstvo"));
    await userEvent.click(screen.getByText("Animalia"));
    await waitFor(() =>
      expect(mockTaxonomy).toHaveBeenCalledWith("", "PHYLUM", 100),
    );
  });

  it("choosing a rank puts it in the search link and clears the narrower ranks", async () => {
    mockTaxonomy.mockImplementation((_s: string, rank: string) =>
      rank === "KINGDOM"
        ? species(["Animalia"])
        : rank === "PHYLUM"
          ? species(["Chordata"])
          : { data: undefined },
    );
    render(<ExponatFilter />);

    await userEvent.click(screen.getByPlaceholderText("Izaberi koljeno"));
    await userEvent.click(screen.getByText("Chordata"));
    await waitFor(() => expect(searchQuery().phylum).toBe("Chordata"));

    // picking a broader rank again resets the phylum
    await userEvent.click(screen.getByPlaceholderText("Izaberi kraljevstvo"));
    await userEvent.click(screen.getByText("Animalia"));
    await waitFor(() => {
      expect(searchQuery().kingdom).toBe("Animalia");
      expect(searchQuery()).not.toHaveProperty("phylum");
    });
  });
});
