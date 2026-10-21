import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import toast from "react-hot-toast";

jest.mock("components/SpeechToText", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("components/AuthorshipButton", () => ({
  __esModule: true,
  default: ({ form }: any) => (
    <button
      type="button"
      onClick={() =>
        form.setValue(
          "authorshipInfoId",
          "5b2f3c1e-2a4d-4c6e-9d1a-3e7f8a9b0c1d",
        )
      }
    >
      set authorship
    </button>
  ),
}));

const api = {
  uploadImage: { mutateAsync: jest.fn() },
  uploadDocument: { mutateAsync: jest.fn() },
  createSocialPost: { mutateAsync: jest.fn() },
  updateSocialPost: { mutateAsync: jest.fn() },
  createWork: { mutateAsync: jest.fn() },
  updateWork: { mutateAsync: jest.fn() },
};
jest.mock("@/api/useUploadFile", () => ({
  useUploadFile: () => api.uploadImage,
}));
jest.mock("@/api/useUploadDocument", () => ({
  useUploadDocument: () => api.uploadDocument,
}));
jest.mock("@/api/useCreateSocialPost", () => ({
  useCreateSocialPost: () => api.createSocialPost,
}));
jest.mock("@/api/useUpdateSocialPost", () => ({
  useUpdateSocialPost: () => api.updateSocialPost,
}));
jest.mock("@/api/usePostWork", () => ({ usePostWork: () => api.createWork }));
jest.mock("@/api/useUpdateWork", () => ({
  useUpdateWork: () => api.updateWork,
}));

import { SocialPostForm } from "../SocialPostForm/SocialPostForm";
import { WorksForm } from "../WorksForm/WorksForm";

const UUID = "5b2f3c1e-2a4d-4c6e-9d1a-3e7f8a9b0c1d";
const png = (name: string) =>
  new File([new Uint8Array(8)], name, { type: "image/png" });
const pdf = (name: string) =>
  new File(["%PDF"], name, { type: "application/pdf" });
const fileInputs = (c: HTMLElement) =>
  Array.from(c.querySelectorAll('input[type="file"]')) as HTMLInputElement[];

beforeEach(() => {
  api.uploadImage.mutateAsync.mockImplementation(
    async ({ file }) => `http://files/${file.name}`,
  );
  api.uploadDocument.mutateAsync.mockImplementation(
    async ({ file }) => `http://files/${file.name}`,
  );
  api.createSocialPost.mutateAsync.mockResolvedValue({});
  api.updateSocialPost.mutateAsync.mockResolvedValue({});
  api.createWork.mutateAsync.mockResolvedValue({});
  api.updateWork.mutateAsync.mockResolvedValue({});
  jest.spyOn(window, "confirm").mockReturnValue(true);
});

describe("SocialPostForm", () => {
  const fill = async (
    title = "Dan otvorenih vrata",
    text = "Pridružite nam se u subotu",
  ) => {
    await userEvent.type(screen.getByPlaceholderText("Naslov"), title);
    await userEvent.type(screen.getByPlaceholderText("Tekst"), text);
  };
  const submit = () =>
    userEvent.click(screen.getByRole("button", { name: "Objavi" }));

  it("lists every post type with its Croatian name", () => {
    render(<SocialPostForm organisationId="o1" />);
    for (const label of [
      "Priča",
      "EU Projekt",
      "Događaj",
      "Vijesti",
      "Radionica",
      "Vodič",
    ])
      expect(screen.getByRole("option", { name: label })).toBeInTheDocument();
  });

  it("publishes a text announcement after a confirmation", async () => {
    render(<SocialPostForm organisationId="o1" />);
    await fill();
    await submit();
    await waitFor(() =>
      expect(api.createSocialPost.mutateAsync).toHaveBeenCalled(),
    );
    expect(window.confirm).toHaveBeenCalled();
    expect(api.createSocialPost.mutateAsync).toHaveBeenCalledWith({
      organisationId: "o1",
      data: expect.objectContaining({
        title: "Dan otvorenih vrata",
        text: "Pridružite nam se u subotu",
        organisationId: "o1",
        images: [],
        type: "STORY",
      }),
    });
  });

  it("does nothing when the author declines the confirmation", async () => {
    (window.confirm as jest.Mock).mockReturnValue(false);
    render(<SocialPostForm organisationId="o1" />);
    await fill();
    await submit();
    await waitFor(() => expect(window.confirm).toHaveBeenCalled());
    expect(api.createSocialPost.mutateAsync).not.toHaveBeenCalled();
  });

  it.each([
    [
      "a short title",
      "Kra",
      "Dovoljno dugačak tekst",
      "Naslov mora imati više od 5 slova",
    ],
    [
      "a short text",
      "Dobar naslov",
      "Kratko",
      "Tekst mora imati više od 10 slova",
    ],
  ])("rejects %s", async (_n, title, text, message) => {
    render(<SocialPostForm organisationId="o1" />);
    await fill(title, text);
    await submit();
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(api.createSocialPost.mutateAsync).not.toHaveBeenCalled();
  });

  it("images require authorship information", async () => {
    const { container } = render(<SocialPostForm organisationId="o1" />);
    await fill();
    await userEvent.upload(fileInputs(container)[0], png("a.png"));
    await submit();
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Morate dodati autorske informacije za slike",
      ),
    );
    expect(api.createSocialPost.mutateAsync).not.toHaveBeenCalled();
    expect(api.uploadImage.mutateAsync).not.toHaveBeenCalled();
  });

  it("uploads every image into the social post directory and attaches the URLs", async () => {
    const { container } = render(<SocialPostForm organisationId="o1" />);
    await fill();
    await userEvent.upload(fileInputs(container)[0], [
      png("a.png"),
      png("b.png"),
    ]);
    await userEvent.click(screen.getByText("set authorship"));
    await submit();
    await waitFor(() =>
      expect(api.createSocialPost.mutateAsync).toHaveBeenCalled(),
    );
    expect(api.uploadImage.mutateAsync).toHaveBeenCalledTimes(2);
    expect(
      api.createSocialPost.mutateAsync.mock.calls[0][0].data,
    ).toMatchObject({
      images: ["http://files/a.png", "http://files/b.png"],
      authorshipInfoId: UUID,
    });
  });

  describe("editing", () => {
    const current = {
      id: "s1",
      title: "Stara najava",
      text: "Stari tekst najave",
      type: "NEWS",
      images: ["http://files/old.png"],
    } as any;

    it("starts with the stored announcement", () => {
      render(<SocialPostForm organisationId="o1" currentValues={current} />);
      expect(screen.getByPlaceholderText("Naslov")).toHaveValue("Stara najava");
      expect(screen.getByRole("combobox")).toHaveValue("NEWS");
    });

    it("updates instead of creating and keeps the stored images", async () => {
      render(<SocialPostForm organisationId="o1" currentValues={current} />);
      await userEvent.clear(screen.getByPlaceholderText("Naslov"));
      await userEvent.type(
        screen.getByPlaceholderText("Naslov"),
        "Nova najava",
      );
      await submit();
      await waitFor(() =>
        expect(api.updateSocialPost.mutateAsync).toHaveBeenCalled(),
      );
      expect(api.createSocialPost.mutateAsync).not.toHaveBeenCalled();
      expect(api.uploadImage.mutateAsync).not.toHaveBeenCalled();
      expect(api.updateSocialPost.mutateAsync.mock.calls[0][0]).toMatchObject({
        id: "s1",
        organisationId: "o1",
      });
    });

    it("sends the edited fields as the `socialPost` of the update", async () => {
      render(<SocialPostForm organisationId="o1" currentValues={current} />);
      await userEvent.clear(screen.getByPlaceholderText("Naslov"));
      await userEvent.type(
        screen.getByPlaceholderText("Naslov"),
        "Nova najava",
      );
      await submit();
      await waitFor(() =>
        expect(api.updateSocialPost.mutateAsync).toHaveBeenCalled(),
      );
      expect(
        api.updateSocialPost.mutateAsync.mock.calls[0][0].socialPost,
      ).toMatchObject({
        title: "Nova najava",
      });
    });
  });
});

describe("WorksForm", () => {
  const abstract = "a".repeat(120);
  const fill = async (title = "Flora Jadrana", description = abstract) => {
    await userEvent.type(screen.getByPlaceholderText("Naslov"), title);
    await userEvent.type(screen.getByPlaceholderText("Abstrakt"), description, {
      delay: null,
    });
  };
  const submit = () =>
    userEvent.click(screen.getByRole("button", { name: "Pošalji" }));

  it("offers the publication types in Croatian", () => {
    render(<WorksForm organisationId="o1" />);
    expect(screen.getByRole("option", { name: "Knjiga" })).toBeInTheDocument();
  });

  it("creates a work in the organisation", async () => {
    render(<WorksForm organisationId="o1" />);
    await fill();
    await userEvent.type(
      screen.getByPlaceholderText("Upišite vrijednost"),
      "flora",
    );
    await userEvent.click(screen.getByTitle("Dodaj"));
    await submit();
    await waitFor(() => expect(api.createWork.mutateAsync).toHaveBeenCalled());
    expect(api.createWork.mutateAsync).toHaveBeenCalledWith({
      organisationId: "o1",
      body: expect.objectContaining({
        title: "Flora Jadrana",
        description: abstract,
        tags: ["flora"],
        organisationId: "o1",
      }),
    });
    expect(api.updateWork.mutateAsync).not.toHaveBeenCalled();
  });

  it.each([
    ["a short title", "Kra", abstract, "Naslov mora biti najmanje 5 slova dug"],
    [
      "a short abstract",
      "Flora Jadrana",
      "prekratko",
      "Abstrakt treba biti dug najmanje 100 slova",
    ],
  ])("rejects %s", async (_n, title, description, message) => {
    render(<WorksForm organisationId="o1" />);
    await fill(title, description);
    await submit();
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(api.createWork.mutateAsync).not.toHaveBeenCalled();
  });

  it("uploads the poster as an image and the documents as pdfs, then attaches the URLs", async () => {
    const { container } = render(<WorksForm organisationId="o1" />);
    await fill();
    const [poster, document_, presentation] = fileInputs(container);
    await userEvent.upload(poster, png("poster.png"));
    await userEvent.upload(document_, pdf("paper.pdf"));
    await userEvent.upload(presentation, pdf("slides.pdf"));
    await submit();
    await waitFor(() => expect(api.createWork.mutateAsync).toHaveBeenCalled());
    expect(api.uploadImage.mutateAsync).toHaveBeenCalledWith({
      file: expect.objectContaining({ name: "poster.png" }),
      directory: "work",
    });
    expect(api.uploadDocument.mutateAsync).toHaveBeenCalledTimes(2);
    expect(api.createWork.mutateAsync.mock.calls[0][0].body).toMatchObject({
      poster: "http://files/poster.png",
      document: "http://files/paper.pdf",
      presentation: "http://files/slides.pdf",
    });
  });

  it("a failed upload is reported to the user", async () => {
    const { container } = render(<WorksForm organisationId="o1" />);
    await fill();
    api.uploadImage.mutateAsync.mockRejectedValue(new Error("network"));
    await userEvent.upload(fileInputs(container)[0], png("poster.png"));
    await submit();
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Greška prilikom uploada postera",
      ),
    );
  });

  describe("editing", () => {
    const work = {
      id: "w1",
      title: "Stari naslov",
      description: "b".repeat(120),
      tags: ["flora", "jadran"],
      type: "BOOK",
      poster: "http://files/old-poster.png",
      document: "http://files/old.pdf",
      presentation: undefined,
    } as any;

    it("starts with the stored title, abstract and type", () => {
      render(<WorksForm organisationId="o1" isEdit work={work} />);
      expect(screen.getByPlaceholderText("Naslov")).toHaveValue("Stari naslov");
      expect(screen.getByRole("combobox")).toHaveValue("BOOK");
    });

    it("updates the work and keeps the stored files when none are replaced", async () => {
      render(<WorksForm organisationId="o1" isEdit work={work} />);
      await userEvent.clear(screen.getByPlaceholderText("Naslov"));
      await userEvent.type(
        screen.getByPlaceholderText("Naslov"),
        "Novi naslov",
      );
      await submit();
      await waitFor(() =>
        expect(api.updateWork.mutateAsync).toHaveBeenCalled(),
      );
      expect(api.updateWork.mutateAsync).toHaveBeenCalledWith({
        id: "w1",
        object: expect.objectContaining({
          title: "Novi naslov",
          poster: "http://files/old-poster.png",
          document: "http://files/old.pdf",
        }),
      });
      expect(api.createWork.mutateAsync).not.toHaveBeenCalled();
    });

    it("shows a replace button instead of an upload field for stored files", () => {
      const { container } = render(
        <WorksForm organisationId="o1" isEdit work={work} />,
      );
      expect(
        screen.getByRole("button", { name: "Izmijeni poster" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Izmijeni dokument" }),
      ).toBeInTheDocument();
      expect(fileInputs(container)).toHaveLength(1); // only the presentation is missing
    });

    it("lets the author replace a stored poster", async () => {
      const { container } = render(
        <WorksForm organisationId="o1" isEdit work={work} />,
      );
      await userEvent.click(
        screen.getByRole("button", { name: "Izmijeni poster" }),
      );
      expect(fileInputs(container)).toHaveLength(2);
    });

    it("starts with the stored tags", () => {
      render(<WorksForm organisationId="o1" isEdit work={work} />);
      expect(screen.getByText("flora")).toBeInTheDocument();
      expect(screen.getByText("jadran")).toBeInTheDocument();
    });
  });
});
