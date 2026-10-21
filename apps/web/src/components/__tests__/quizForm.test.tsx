import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("components/SpeechToText", () => ({
  __esModule: true,
  default: () => null,
}));
const api = {
  create: { mutateAsync: jest.fn(), isError: false },
  update: { mutateAsync: jest.fn(), isError: false },
  upload: { mutateAsync: jest.fn() },
};
jest.mock("@/api/useCreateQuiz", () => ({ useCreateQuiz: () => api.create }));
jest.mock("@/api/useUpdateQuiz", () => ({ useUpdateQuiz: () => api.update }));
jest.mock("@/api/useUploadFile", () => ({ useUploadFile: () => api.upload }));

import { QuizForm } from "../QuizForm/QuizForm";

const question = {
  id: "q1",
  question: "Koja je boja lisice?",
  questionType: "MULTIPLE_CHOICE",
  options: ["crvena", "plava"],
  correct: ["crvena"],
  points: 2,
};
const quiz = (over: Record<string, unknown> = {}) =>
  ({
    id: "quiz-1",
    title: "Kviz o životinjama",
    description: "Provjerite znanje",
    coverImage: "",
    isRetakeable: true,
    isTest: false,
    isAnonymousAllowed: false,
    timeLimitType: "TOTAL",
    timeLimitTotal: 5,
    difficulty: "EASY",
    questions: [question],
    ...over,
  }) as any;

beforeEach(() => {
  api.create.mutateAsync.mockResolvedValue({});
  api.update.mutateAsync.mockResolvedValue({});
  api.upload.mutateAsync.mockResolvedValue("http://files/cover.png");
  api.create.isError = false;
  api.update.isError = false;
  jest.useFakeTimers({ advanceTimers: true });
});
afterEach(() => jest.useRealTimers());

describe("QuizForm", () => {
  it("shows the quiz settings and an empty question form", () => {
    render(<QuizForm organisationId="o1" defaultValues={quiz()} />);
    expect(screen.getByPlaceholderText("Naziv kviza")).toHaveValue(
      "Kviz o životinjama",
    );
    expect(screen.getByPlaceholderText("Opis kviza")).toHaveValue(
      "Provjerite znanje",
    );
    expect(screen.getAllByText("Dodaj pitanje")).toHaveLength(2); // heading and button
    expect(
      screen.getByRole("button", { name: "Dodaj pitanje" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Dozvoljeno ponavljanje")).toBeInTheDocument();
  });

  it("offers time limit types and difficulties by their Croatian names", () => {
    render(<QuizForm organisationId="o1" defaultValues={quiz()} />);
    expect(
      screen.getByRole("option", { name: "Ukupno vrijeme" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Lako" })).toBeInTheDocument();
  });

  it("saving an existing quiz updates it, converting minutes to milliseconds", async () => {
    render(<QuizForm organisationId="o1" defaultValues={quiz()} />);
    await userEvent.click(screen.getByRole("button", { name: "Kreiraj kviz" }));
    await waitFor(() => expect(api.update.mutateAsync).toHaveBeenCalled());
    expect(api.create.mutateAsync).not.toHaveBeenCalled();
    const call = api.update.mutateAsync.mock.calls[0][0];
    expect(call).toMatchObject({ organisationId: "o1", id: "quiz-1" });
    expect(call.data).toMatchObject({
      title: "Kviz o životinjama",
      timeLimitTotal: 5 * 60 * 1000,
      isRetakeable: true,
    });
    expect(call.data.questions).toHaveLength(1);
  });

  it("uploads a chosen cover image first", async () => {
    const { container } = render(
      <QuizForm organisationId="o1" defaultValues={quiz()} />,
    );
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await userEvent.upload(
      input,
      new File([new Uint8Array(4)], "cover.png", { type: "image/png" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Kreiraj kviz" }));
    await waitFor(() => expect(api.update.mutateAsync).toHaveBeenCalled());
    expect(api.upload.mutateAsync).toHaveBeenCalledWith({
      file: expect.objectContaining({ name: "cover.png" }),
      directory: "quiz",
    });
  });

  describe("after saving", () => {
    const hrefs: string[] = [];
    const original = window.location;
    beforeEach(() => {
      hrefs.length = 0;
      Object.defineProperty(window, "location", {
        configurable: true,
        value: {
          ...original,
          get href() {
            return "http://localhost/";
          },
          set href(v: string) {
            hrefs.push(v);
          },
        },
      });
    });
    afterEach(() =>
      Object.defineProperty(window, "location", {
        configurable: true,
        value: original,
      }),
    );

    const save = async () => {
      render(<QuizForm organisationId="o1" defaultValues={quiz()} />);
      await userEvent.click(
        screen.getByRole("button", { name: "Kreiraj kviz" }),
      );
      await waitFor(() => expect(api.update.mutateAsync).toHaveBeenCalled());
      jest.advanceTimersByTime(3000);
    };

    it("navigates to the organisation after three seconds", async () => {
      await save();
      expect(hrefs).toHaveLength(1);
      expect(hrefs[0]).toContain("organisation/o1");
    });

    it("navigates to an absolute address", async () => {
      await save();
      expect(hrefs[0]).toBe("/organisation/o1");
    });
  });

  it("a quiz without any question cannot be saved", async () => {
    render(
      <QuizForm
        organisationId="o1"
        defaultValues={quiz({ questions: undefined })}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Kreiraj kviz" }));
    await new Promise((r) => setTimeout(r, 30));
    expect(api.update.mutateAsync).not.toHaveBeenCalled();
    expect(api.create.mutateAsync).not.toHaveBeenCalled();
  });

  it("lists the questions that were added", () => {
    render(<QuizForm organisationId="o1" defaultValues={quiz()} />);
    expect(screen.getByText("Koja je boja lisice?")).toBeInTheDocument();
  });

  // The checkboxes, the time limit and the difficulty have defaults; only a
  // question is required.
  it("a new quiz can be created without touching every checkbox", async () => {
    render(<QuizForm organisationId="o1" />);
    await userEvent.type(
      screen.getByPlaceholderText("Naziv kviza"),
      "Novi kviz",
    );
    await userEvent.type(
      screen.getByPlaceholderText("Opis kviza"),
      "Opis novog kviza",
    );
    await userEvent.type(
      screen.getByPlaceholderText("Pitanje"),
      "Je li lisica sisavac?",
    );
    const questionType = screen
      .getByRole("option", { name: "Točno/Netočno" })
      .closest("select") as HTMLSelectElement;
    await userEvent.selectOptions(questionType, "TRUE_FALSE");
    await userEvent.type(screen.getByPlaceholderText("Broj bodova"), "1");
    await userEvent.click(
      screen.getByRole("button", { name: "Dodaj pitanje" }),
    );
    expect(
      await screen.findByText("Je li lisica sisavac?"),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Kreiraj kviz" }));
    await waitFor(() => expect(api.create.mutateAsync).toHaveBeenCalled());
  });
});
