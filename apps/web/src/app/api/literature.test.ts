import {
  getGbifWork,
  getGbifWorks,
  LiteratureToWorkMapper,
} from "./serverLiterature";

const literature = (over: Record<string, unknown> = {}) =>
  ({
    id: "lit-1",
    title: "Birds of Croatia",
    abstract: "About birds",
    authors: [
      { firstName: "Ana", lastName: "Anić" },
      { firstName: "Ivo", lastName: "Ivić" },
    ],
    publisher: "Nature",
    published: "2020-01-01",
    topics: ["BIODIVERSITY"],
    keywords: ["birds", "a-very-very-long-keyword-that-is-dropped"],
    literatureType: "JOURNAL",
    websites: ["https://example.org/paper"],
    ...over,
  }) as any;

describe("LiteratureToWorkMapper", () => {
  it("maps a GBIF record to a work", () => {
    expect(LiteratureToWorkMapper(literature())).toMatchObject({
      id: "lit-1",
      title: "Birds of Croatia",
      description: "About birds",
      authorId: "GBIF",
      auhtorName: "Ana Anić, Ivo Ivić",
      organisationId: "GBIF",
      organisationName: "Nature",
      isGbif: true,
      type: "JOURNAL",
      website: "https://example.org/paper",
      amountOfSaves: 0,
    });
  });

  it("drops overly long keywords from the tags", () => {
    const { tags } = LiteratureToWorkMapper(literature());
    expect(tags).toContain("birds");
    expect(tags).not.toContain("a-very-very-long-keyword-that-is-dropped");
  });
});

describe("GBIF fetching", () => {
  const fetchMock = jest.fn();
  beforeEach(() => {
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it("getGbifWorks searches the literature API and maps the results", async () => {
    fetchMock.mockResolvedValue({
      json: async () => ({ results: [literature()] }),
    });
    const works = await getGbifWorks({ q: "birds", limit: 10 } as any, 3);
    expect(works).toEqual([expect.objectContaining({ id: "lit-1" })]);
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain(
      "https://api.gbif.org/v1/literature/search?limit=20&",
    );
    expect(url).toContain("q=birds");
    expect(url).toContain("offset=20"); // (page - 1) * limit
  });

  it("getGbifWorks returns undefined on failure", async () => {
    fetchMock.mockRejectedValue(new Error("down"));
    await expect(getGbifWorks({} as any)).resolves.toBeUndefined();
  });

  it("getGbifWork encodes the id and maps the record", async () => {
    fetchMock.mockResolvedValue({ json: async () => literature() });
    await expect(getGbifWork("a/b")).resolves.toMatchObject({ id: "lit-1" });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://api.gbif.org/v1/literature/a%2Fb",
    );
  });
});
