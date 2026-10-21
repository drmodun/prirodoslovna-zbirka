import { act, renderHook } from "@testing-library/react";
import toast from "react-hot-toast";

const api = {
  readOrCreate: { mutateAsync: jest.fn() },
  create: { mutateAsync: jest.fn() },
  update: { mutateAsync: jest.fn() },
  image: { mutateAsync: jest.fn() },
  model: { mutateAsync: jest.fn() },
  video: { mutateAsync: jest.fn() },
};
jest.mock("@/api/useReadOrCreateCategorization", () => ({
  useReadOrCreateCategorization: () => api.readOrCreate,
}));
jest.mock("@/api/useCreateExponat", () => ({
  useCreateExponat: () => api.create,
}));
jest.mock("@/api/useUpdateExponat", () => ({
  useUpdateExponat: () => api.update,
}));
jest.mock("@/api/useUploadFile", () => ({ useUploadFile: () => api.image }));
jest.mock("@/api/useUploadThreeDimensionalModel", () => ({
  useUploadThreeDimensionalModel: () => api.model,
}));
jest.mock("@/api/useUploadVideo", () => ({ useUploadVideo: () => api.video }));

import {
  createExponatSchema,
  getExponatKindOptions,
  isMineral,
} from "../ExponatForm/exponatSchema";
import { translator } from "test-utils/intl";
import { useExponatSubmit } from "../ExponatForm/useExponatSubmit";

const UUID = "5b2f3c1e-2a4d-4c6e-9d1a-3e7f8a9b0c1d";
const valid = (over: Record<string, unknown> = {}) => ({
  name: "Crvena lisica",
  description: "Mala zvijer iz porodice pasa",
  alternateName: "Vulpes vulpes",
  funFacts: ["Brza"],
  exponatKind: "EUCARIOT",
  attributes: { visina: "40cm" },
  authorshipInfoId: UUID,
  mainImage: undefined,
  ...over,
});
const issues = (data: unknown) => {
  const result = createExponatSchema(translator("ExponatForm")).safeParse(data);
  return result.success
    ? []
    : result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
};

describe("exponatSchema", () => {
  it("accepts a complete exponat", () => {
    expect(issues(valid())).toEqual([]);
  });

  it.each([
    ["a short name", { name: "Lis" }, "name"],
    ["a short description", { description: "kratko" }, "description"],
    ["a one letter nomenclature", { alternateName: "V" }, "alternateName"],
    ["no fun facts", { funFacts: [] }, "funFacts"],
    ["a one letter fun fact", { funFacts: ["a"] }, "funFacts.0"],
    ["an unknown kind", { exponatKind: "ANIMAL" }, "exponatKind"],
    ["a non-uuid author", { authorshipInfoId: "abc" }, "authorshipInfoId"],
    ["no author", { authorshipInfoId: undefined }, "authorshipInfoId"],
  ])("rejects %s", (_n, over, path) => {
    expect(issues(valid(over)).some((i) => i.startsWith(path))).toBe(true);
  });

  it("requires at least one attribute", () => {
    expect(issues(valid({ attributes: {} }))).toContain(
      "attributes: Mora postojati barem jedan atribut",
    );
  });

  it("limits the name and description length", () => {
    expect(issues(valid({ name: "x".repeat(101) })).length).toBeGreaterThan(0);
    expect(
      issues(valid({ description: "x".repeat(2001) })).length,
    ).toBeGreaterThan(0);
  });

  it.each(["EUCARIOT", "PROCARIOT", "MINERAL"])(
    "accepts the kind %s",
    (kind) => {
      expect(issues(valid({ exponatKind: kind }))).toEqual([]);
    },
  );

  it("offers the same kinds as the schema accepts, with Croatian labels", () => {
    const exponatKindOptions = getExponatKindOptions(
      translator("ExponatKinds"),
    );
    expect(exponatKindOptions.map((o) => o.value)).toEqual([
      "EUCARIOT",
      "PROCARIOT",
      "MINERAL",
    ]);
    expect(exponatKindOptions.map((o) => o.label)).toEqual([
      "Eukariot",
      "Prokariot",
      "Mineral",
    ]);
  });
});

describe("isMineral", () => {
  it.each([
    ["MINERAL", true],
    ["mineral", true],
    ["EUCARIOT", false],
    [undefined, false],
  ])("%p -> %s", (kind, expected) => {
    expect(isMineral(kind)).toBe(expected);
  });
});

describe("useExponatSubmit", () => {
  const files = (over: Record<string, File[]> = {}) => ({
    mainImage: [new File(["x"], "main.png")],
    thirdDimensionalModel: [] as File[],
    video: [] as File[],
    ...over,
  });
  const species = [{ species: "Vulpes vulpes", key: 1 }] as any;
  const submitter = (params: Record<string, unknown> = {}) =>
    renderHook(() =>
      useExponatSubmit({ organisationId: "o1", species, ...params } as any),
    ).result.current;

  beforeEach(() => {
    api.readOrCreate.mutateAsync.mockResolvedValue("cat-1");
    api.create.mutateAsync.mockResolvedValue({ id: "e-new" });
    api.update.mutateAsync.mockResolvedValue({});
    api.image.mutateAsync.mockResolvedValue("http://files/main.png");
    api.model.mutateAsync.mockResolvedValue("http://files/model.glb");
    api.video.mutateAsync.mockResolvedValue("http://files/video.mp4");
    jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  it("creates an exponat in the organisation with the resolved categorization and uploads", async () => {
    const submit = submitter();
    await act(async () => {
      await submit(valid(), files());
    });
    expect(api.readOrCreate.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ species: "Vulpes vulpes", domain: "EUCARIOT" }),
    );
    expect(api.create.mutateAsync).toHaveBeenCalledWith({
      organisationId: "o1",
      exponat: expect.objectContaining({
        name: "Crvena lisica",
        alternateName: "Vulpes vulpes",
        ExponatKind: "EUCARIOT",
        authorId: "o1",
        authorshipInfoId: UUID,
        categorizationId: "cat-1",
        mainImage: "http://files/main.png",
        attributes: JSON.stringify({ visina: "40cm" }),
      }),
    });
  });

  it("uploads image, model and video to the exponat directory", async () => {
    const submit = submitter();
    const all = files({
      thirdDimensionalModel: [new File(["m"], "m.glb")],
      video: [new File(["v"], "v.mp4")],
    });
    await act(async () => {
      await submit(valid(), all);
    });
    expect(api.image.mutateAsync).toHaveBeenCalledWith({
      file: all.mainImage[0],
      directory: "exponat",
    });
    expect(api.model.mutateAsync).toHaveBeenCalledWith({
      file: all.thirdDimensionalModel[0],
      directory: "exponat",
    });
    expect(api.video.mutateAsync).toHaveBeenCalledWith({
      file: all.video[0],
      directory: "exponat",
    });
    expect(api.create.mutateAsync.mock.calls[0][0].exponat).toMatchObject({
      thirdDimensionalModel: "http://files/model.glb",
      video: "http://files/video.mp4",
    });
  });

  it("requires a main image when creating", async () => {
    const submit = submitter();
    await act(async () => {
      await submit(valid(), files({ mainImage: [] }));
    });
    expect(toast.error).toHaveBeenCalledWith(
      "Mora postojati glavna slika eksponata",
    );
    expect(api.create.mutateAsync).not.toHaveBeenCalled();
  });

  it("refuses a nomenclature that is not a known species", async () => {
    const submit = submitter();
    await act(async () => {
      await submit(valid({ alternateName: "Unknown species" }), files());
    });
    expect(window.alert).toHaveBeenCalledWith("Nomenklatura nije validna");
    expect(api.create.mutateAsync).not.toHaveBeenCalled();
    expect(api.image.mutateAsync).not.toHaveBeenCalled();
  });

  it("stops when the categorization cannot be created", async () => {
    api.readOrCreate.mutateAsync.mockResolvedValue(undefined);
    const submit = submitter();
    await act(async () => {
      await submit(valid(), files());
    });
    expect(toast.error).toHaveBeenCalledWith(
      "Greška prilikom kreiranja kategorizacije",
    );
    expect(api.create.mutateAsync).not.toHaveBeenCalled();
  });

  it("minerals skip the categorization entirely", async () => {
    const submit = submitter({ species: [] });
    await act(async () => {
      await submit(
        valid({ exponatKind: "MINERAL", alternateName: "Kvarc" }),
        files(),
      );
    });
    expect(api.readOrCreate.mutateAsync).not.toHaveBeenCalled();
    expect(
      api.create.mutateAsync.mock.calls[0][0].exponat.categorizationId,
    ).toBeUndefined();
  });

  it("editing updates the existing exponat, without requiring a new image", async () => {
    const submit = submitter({ isEdit: true, values: { id: "e1" } });
    await act(async () => {
      await submit(valid(), files({ mainImage: [] }));
    });
    expect(api.update.mutateAsync).toHaveBeenCalledWith({
      exponatId: "e1",
      updateExponatDto: expect.objectContaining({ name: "Crvena lisica" }),
    });
    expect(api.create.mutateAsync).not.toHaveBeenCalled();
    expect(api.image.mutateAsync).not.toHaveBeenCalled();
  });

  it("editing saves an exponat whose nomenclature is not in the suggestion list", async () => {
    const submit = submitter({
      isEdit: true,
      values: { id: "e1" },
      species: [],
    });
    await act(async () => {
      await submit(valid(), files({ mainImage: [] }));
    });
    expect(api.update.mutateAsync).toHaveBeenCalled();
  });

  it("goes back to the organisation page after saving", async () => {
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
    const submit = submitter();
    await act(async () => {
      await submit(valid(), files());
    });
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(hrefs).toEqual(["/organisation/o1"]);
    Object.defineProperty(window, "location", {
      configurable: true,
      value: original,
    });
  });
});
