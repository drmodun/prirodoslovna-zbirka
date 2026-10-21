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
      onClick={() => form.setValue("authorshipInfoId", "ai-1")}
    >
      set authorship
    </button>
  ),
}));

const api = {
  upload: { mutateAsync: jest.fn() },
  createPost: { mutateAsync: jest.fn() },
  updatePost: { mutateAsync: jest.fn() },
};
jest.mock("@/api/useUploadFile", () => ({ useUploadFile: () => api.upload }));
jest.mock("@/api/useCreatePost", () => ({
  useCreatePost: () => api.createPost,
}));
jest.mock("@/api/useUpdatePost", () => ({
  useUpdatePost: () => api.updatePost,
}));

import { PostForm } from "../PostForm/PostForm";
import { QuestionForm } from "../QuestionForm/QuestionForm";

const image = (name: string) =>
  new File([new Uint8Array(8)], name, { type: "image/png" });
const uploads = (c: HTMLElement) =>
  Array.from(c.querySelectorAll('input[type="file"]')) as HTMLInputElement[];

beforeEach(() => {
  api.upload.mutateAsync.mockImplementation(
    async ({ file }) => `http://files/${file.name}`,
  );
  api.createPost.mutateAsync.mockResolvedValue({ id: "p-new" });
  api.updatePost.mutateAsync.mockResolvedValue({ id: "p1" });
});

describe("PostForm (create)", () => {
  const fill = async (
    title = "Lisica u šumi",
    text = "Vidjeli smo lisicu kako lovi",
  ) => {
    await userEvent.type(screen.getByPlaceholderText("Naslov"), title);
    await userEvent.type(
      screen.getByPlaceholderText("Unesite tekst objave, markdown je podržan"),
      text,
    );
  };

  it("uploads both pictures and then creates the post for the exponat", async () => {
    const { container } = render(<PostForm exponatId="e1" />);
    await fill();
    const [thumbnail, main] = uploads(container);
    await userEvent.upload(thumbnail, image("thumb.png"));
    await userEvent.upload(main, image("main.png"));
    await userEvent.click(screen.getByText("set authorship"));
    await userEvent.click(
      screen.getByRole("button", { name: "Napravi objavu" }),
    );

    await waitFor(() => expect(api.createPost.mutateAsync).toHaveBeenCalled());
    expect(api.upload.mutateAsync).toHaveBeenCalledTimes(2);
    expect(
      api.upload.mutateAsync.mock.calls.every(([a]) => a.directory === "post"),
    ).toBe(true);
    expect(api.createPost.mutateAsync).toHaveBeenCalledWith({
      exponatId: "e1",
      post: expect.objectContaining({
        title: "Lisica u šumi",
        text: "Vidjeli smo lisicu kako lovi",
        image: "http://files/main.png",
        thumbnailImage: "http://files/thumb.png",
      }),
    });
  });

  it("sends the authorship information chosen for the post", async () => {
    const { container } = render(<PostForm exponatId="e1" />);
    await fill();
    const [thumbnail, main] = uploads(container);
    await userEvent.upload(thumbnail, image("thumb.png"));
    await userEvent.upload(main, image("main.png"));
    await userEvent.click(screen.getByText("set authorship"));
    await userEvent.click(
      screen.getByRole("button", { name: "Napravi objavu" }),
    );
    await waitFor(() => expect(api.createPost.mutateAsync).toHaveBeenCalled());
    expect(
      api.createPost.mutateAsync.mock.calls[0][0].post.authorshipInfoId,
    ).toBe("ai-1");
  });

  it("insists on both pictures when creating", async () => {
    const { container } = render(<PostForm exponatId="e1" />);
    await fill();
    await userEvent.upload(uploads(container)[0], image("thumb.png"));
    await userEvent.click(
      screen.getByRole("button", { name: "Napravi objavu" }),
    );
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Morate dodati slike", {
        id: "create-post",
      }),
    );
    expect(api.createPost.mutateAsync).not.toHaveBeenCalled();
    expect(api.upload.mutateAsync).not.toHaveBeenCalled();
  });

  it.each([
    [
      "a short title",
      "Kra",
      "Dovoljno dugačak tekst",
      "Naslov mora imati najmanje 5 znakova",
    ],
    [
      "a short text",
      "Dobar naslov",
      "Kratko",
      "Tekst mora imati najmanje 10 znakova",
    ],
  ])("rejects %s", async (_n, title, text, message) => {
    render(<PostForm exponatId="e1" />);
    await fill(title, text);
    await userEvent.click(
      screen.getByRole("button", { name: "Napravi objavu" }),
    );
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(api.createPost.mutateAsync).not.toHaveBeenCalled();
  });
});

describe("PostForm (edit)", () => {
  const values = {
    id: "p1",
    title: "Stari naslov",
    content: "Stari sadržaj objave",
    image: "http://files/old-main.png",
    thumbnail: "http://files/old-thumb.png",
    authorshipInfo: {},
  } as any;

  it("starts with the stored title and content", () => {
    render(<PostForm exponatId="e1" isEdit values={values} />);
    expect(screen.getByText("Uredi objavu")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Naslov")).toHaveValue("Stari naslov");
    expect(
      screen.getByPlaceholderText("Unesite tekst objave, markdown je podržan"),
    ).toHaveValue("Stari sadržaj objave");
  });

  it("updates the post and keeps the old pictures when none are chosen", async () => {
    render(<PostForm exponatId="e1" isEdit values={values} />);
    await userEvent.clear(screen.getByPlaceholderText("Naslov"));
    await userEvent.type(screen.getByPlaceholderText("Naslov"), "Novi naslov");
    await userEvent.click(
      screen.getByRole("button", { name: "Napravi objavu" }),
    );

    await waitFor(() => expect(api.updatePost.mutateAsync).toHaveBeenCalled());
    expect(api.updatePost.mutateAsync).toHaveBeenCalledWith({
      postId: "p1",
      updatePostDto: expect.objectContaining({
        title: "Novi naslov",
        image: "http://files/old-main.png",
        thumbnailImage: "http://files/old-thumb.png",
      }),
    });
    expect(api.upload.mutateAsync).not.toHaveBeenCalled();
    expect(api.createPost.mutateAsync).not.toHaveBeenCalled();
  });

  it("replaces only the picture that was changed", async () => {
    const { container } = render(
      <PostForm exponatId="e1" isEdit values={values} />,
    );
    await userEvent.upload(uploads(container)[1], image("new-main.png"));
    await userEvent.click(
      screen.getByRole("button", { name: "Napravi objavu" }),
    );
    await waitFor(() => expect(api.updatePost.mutateAsync).toHaveBeenCalled());
    expect(
      api.updatePost.mutateAsync.mock.calls[0][0].updatePostDto,
    ).toMatchObject({
      image: "http://files/new-main.png",
      thumbnailImage: "http://files/old-thumb.png",
    });
  });
});

describe("QuestionForm", () => {
  const defaults = {
    id: "q1",
    question: "Koja je boja lisice?",
    questionType: "MULTIPLE_CHOICE",
    options: [],
    correct: [],
    points: 5,
  } as any;

  it("offers the question types by their Croatian names", () => {
    render(<QuestionForm onSubmit={jest.fn()} defaultValues={defaults} />);
    expect(
      screen.getByRole("option", { name: "Višestruki izbor" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Točno/Netočno" }),
    ).toBeInTheDocument();
  });

  it("only multiple choice questions let the author enter answer options", async () => {
    render(<QuestionForm onSubmit={jest.fn()} defaultValues={defaults} />);
    expect(screen.getByText("Odgovori")).toBeInTheDocument();
    await userEvent.selectOptions(
      screen.getAllByRole("combobox")[0],
      "TRUE_FALSE",
    );
    await waitFor(() => expect(screen.queryByText("Odgovori")).toBeNull());
  });

  it("shows the time limit field only when asked to", () => {
    const { rerender } = render(
      <QuestionForm onSubmit={jest.fn()} defaultValues={defaults} />,
    );
    expect(
      screen.queryByPlaceholderText("Vrijeme za odgovor (sekunde)"),
    ).toBeNull();
    rerender(
      <QuestionForm
        onSubmit={jest.fn()}
        defaultValues={defaults}
        hasTimeLimit
      />,
    );
    expect(
      screen.getByPlaceholderText("Vrijeme za odgovor (sekunde)"),
    ).toBeInTheDocument();
  });

  it("submits the question with its points", async () => {
    const onSubmit = jest.fn();
    render(
      <QuestionForm
        onSubmit={onSubmit}
        defaultValues={{ ...defaults, points: undefined }}
      />,
    );
    await userEvent.type(screen.getByPlaceholderText("Broj bodova"), "5");
    await userEvent.click(
      screen.getByRole("button", { name: "Dodaj pitanje" }),
    );
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].points).toBe(5);
  });

  it("does not submit a question without text or type", async () => {
    const onSubmit = jest.fn();
    render(
      <QuestionForm
        onSubmit={onSubmit}
        defaultValues={{ ...defaults, question: "", questionType: "" }}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Dodaj pitanje" }),
    );
    await new Promise((r) => setTimeout(r, 20));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("keeps the uploaded question image", async () => {
    const onSubmit = jest.fn();
    api.upload.mutateAsync.mockResolvedValue("http://files/q.png");
    const { container } = render(
      <QuestionForm
        onSubmit={onSubmit}
        defaultValues={{ ...defaults, points: 5 as any }}
      />,
    );
    await userEvent.upload(uploads(container)[0], image("q.png"));
    await userEvent.click(
      screen.getByRole("button", { name: "Dodaj pitanje" }),
    );
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].image).toBe("http://files/q.png");
  });
});
