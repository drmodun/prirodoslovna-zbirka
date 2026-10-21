const create = jest.fn();
jest.mock("openai", () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    audio: { transcriptions: { create } },
  })),
}));
jest.mock("./getUrlServer", () => ({ apiFetch: jest.fn() }));

const ENV = [
  "OPENAI_API_KEY",
  "OPENAI_BASE_URL",
  "OPENAI_MODEL",
  "OPENAI_TRANSCRIPTION_MODEL",
  "TTS_URL",
  "GOOGLE_CLOUD_API_KEY",
  "INTERNAL_API_KEY",
];

/** AI.ts reads its configuration from process.env on import. */
const load = (env: Record<string, string> = {}) => {
  jest.resetModules();
  for (const key of ENV) delete process.env[key];
  Object.assign(process.env, env);
  const ai = require("./AI") as typeof import("./AI");
  const { apiFetch } = require("./getUrlServer") as { apiFetch: jest.Mock };
  return { ...ai, apiFetch };
};

const fetchMock = jest.fn();
beforeEach(() => {
  global.fetch = fetchMock as unknown as typeof fetch;
});
afterAll(() => {
  for (const key of ENV) delete process.env[key];
});

const completion = (content: string) => ({
  json: async () => ({ choices: [{ message: { content } }] }),
});
const wikipedia = (extract: string, type = "standard") => ({
  ok: true,
  json: async () => ({
    type,
    extract,
    content_urls: { desktop: { page: "https://hr.wikipedia.org/wiki/Lisica" } },
  }),
});

describe("getGPT", () => {
  it("does nothing when no AI service is configured", async () => {
    const { getGPT } = load();
    await expect(getGPT("hi")).resolves.toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("calls the chat completions endpoint with the key and model", async () => {
    fetchMock.mockResolvedValue(completion("ok"));
    const { getGPT } = load({ OPENAI_API_KEY: "sk-1", OPENAI_MODEL: "m-1" });
    await getGPT("question");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.openai.com/v1/chat/completions");
    expect(init.headers.Authorization).toBe("Bearer sk-1");
    expect(JSON.parse(init.body)).toMatchObject({
      model: "m-1",
      messages: [{ role: "user", content: "question" }],
    });
  });

  it("a custom base URL is enough (local servers need no key)", async () => {
    fetchMock.mockResolvedValue(completion("ok"));
    const { getGPT } = load({ OPENAI_BASE_URL: "http://ollama:11434/v1///" });
    await getGPT("q");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://ollama:11434/v1/chat/completions");
    expect(init.headers.Authorization).toBeUndefined();
  });

  it("swallows network errors", async () => {
    fetchMock.mockRejectedValue(new Error("down"));
    const { getGPT } = load({ OPENAI_API_KEY: "k" });
    await expect(getGPT("q")).resolves.toBeUndefined();
  });
});

describe("exponatInfoPrompt", () => {
  it("returns the AI answer", async () => {
    fetchMock.mockResolvedValue(completion("Lisica je ..."));
    const { exponatInfoPrompt } = load({ OPENAI_API_KEY: "k" });
    await expect(exponatInfoPrompt("Vulpes vulpes")).resolves.toBe(
      "Lisica je ...",
    );
    expect(
      JSON.parse(fetchMock.mock.calls[0][1].body).messages[0].content,
    ).toContain("Vulpes vulpes");
  });

  it("falls back to Wikipedia (Croatian first) without AI", async () => {
    fetchMock.mockResolvedValue(wikipedia("Lisica je zvijer."));
    const { exponatInfoPrompt } = load();
    const text = await exponatInfoPrompt("Vulpes vulpes");
    expect(text).toContain("Lisica je zvijer.");
    expect(text).toContain("Izvor: https://hr.wikipedia.org/wiki/Lisica");
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://hr.wikipedia.org/api/rest_v1/page/summary/Vulpes_vulpes",
    );
  });

  it("tries English when Croatian has no article, and ignores disambiguation pages", async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce(wikipedia("English text"));
    const { exponatInfoPrompt } = load();
    await expect(exponatInfoPrompt("Fox")).resolves.toContain("English text");
    expect(fetchMock.mock.calls[1][0]).toContain("https://en.wikipedia.org");

    fetchMock.mockReset();
    fetchMock.mockResolvedValue(wikipedia("many things", "disambiguation"));
    await expect(exponatInfoPrompt("Fox")).resolves.toContain("OPENAI_API_KEY");
  });

  it("writes for English readers in English, trying English Wikipedia first", async () => {
    fetchMock.mockResolvedValue(completion("The fox is ..."));
    let ai = load({ OPENAI_API_KEY: "k" });
    // load() resets the modules, so the language is set on the fresh copy.
    require("test-utils/intl").setTestLocale("en");
    await ai.exponatInfoPrompt("Vulpes vulpes");
    expect(
      JSON.parse(fetchMock.mock.calls[0][1].body).messages[0].content,
    ).toContain("written in English");

    fetchMock.mockReset();
    fetchMock.mockResolvedValue(wikipedia("The fox is a canid."));
    ai = load();
    require("test-utils/intl").setTestLocale("en");
    const text = await ai.exponatInfoPrompt("Vulpes vulpes");
    expect(fetchMock.mock.calls[0][0]).toContain("https://en.wikipedia.org");
    expect(text).toContain("Source: https://hr.wikipedia.org/wiki/Lisica");
  });

  it("explains how to enable descriptions when nothing is available", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));
    const { exponatInfoPrompt } = load();
    await expect(exponatInfoPrompt("Fox")).resolves.toContain("OPENAI_API_KEY");
  });
});

describe("summarisePostPrompt", () => {
  it("returns the AI summary", async () => {
    fetchMock.mockResolvedValue(completion("Sažetak"));
    const { summarisePostPrompt } = load({ OPENAI_API_KEY: "k" });
    await expect(summarisePostPrompt("T", "content")).resolves.toBe("Sažetak");
  });

  it("falls back to the opening sentences with markup stripped", async () => {
    const { summarisePostPrompt } = load();
    const content =
      "# Naslov\n\n<p>Prva **rečenica** je ovdje.</p> Druga rečenica ide dalje. " +
      "Treća rečenica je vrlo daleko. ".repeat(40);
    const summary = await summarisePostPrompt("T", content);
    expect(summary.startsWith("Naslov")).toBe(true);
    expect(summary).toContain("Prva rečenica je ovdje.");
    expect(summary).not.toMatch(/[<>#*]/);
    expect(summary.length).toBeLessThan(content.length / 2);
  });

  it("keeps short posts whole", async () => {
    const { summarisePostPrompt } = load();
    await expect(
      summarisePostPrompt("T", "Samo jedna rečenica."),
    ).resolves.toBe("Samo jedna rečenica.");
  });
});

describe("speech to text", () => {
  it("isSpeechToTextConfigured needs AI and a transcription model", async () => {
    await expect(load().isSpeechToTextConfigured()).resolves.toBe(false);
    await expect(
      load({ OPENAI_API_KEY: "k" }).isSpeechToTextConfigured(),
    ).resolves.toBe(true);
    await expect(
      load({
        OPENAI_API_KEY: "k",
        OPENAI_TRANSCRIPTION_MODEL: "",
      }).isSpeechToTextConfigured(),
    ).resolves.toBe(false);
  });

  it("whisperPrompt transcribes base64 audio in Croatian", async () => {
    create.mockResolvedValue({ text: "bok" });
    const { whisperPrompt } = load({ OPENAI_API_KEY: "k" });
    await expect(
      whisperPrompt(Buffer.from("wav").toString("base64")),
    ).resolves.toEqual({
      text: "bok",
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ model: "whisper-1", language: "hr" }),
    );
  });

  it("whisperPrompt does nothing without AI or a transcription model", async () => {
    await expect(load().whisperPrompt("x")).resolves.toBeUndefined();
    await expect(
      load({
        OPENAI_API_KEY: "k",
        OPENAI_TRANSCRIPTION_MODEL: "",
      }).whisperPrompt("x"),
    ).resolves.toBeUndefined();
    expect(create).not.toHaveBeenCalled();
  });
});

describe("ttsPrompt", () => {
  const ok = (text: string) => ({ ok: true, text: async () => text });
  const key = { INTERNAL_API_KEY: "internal" };

  it("does nothing without text or a speech service", async () => {
    await expect(
      load().ttsPrompt("hello", "exponat", "1"),
    ).resolves.toBeUndefined();
    await expect(
      load({ TTS_URL: "http://piper", ...key }).ttsPrompt("", "exponat", "1"),
    ).resolves.toBeUndefined();
  });

  it("returns the stored recording when it already exists", async () => {
    const m = load({ TTS_URL: "http://piper", ...key });
    m.apiFetch.mockResolvedValue(ok("http://files/audio"));
    await expect(m.ttsPrompt("hello", "exponat", "7")).resolves.toBe(
      "http://files/audio",
    );
    const [segments] = m.apiFetch.mock.calls[0];
    expect(segments.slice(0, 3)).toEqual(["blobs", "audio", "audio-exponat"]);
    expect(segments[3]).toMatch(/^7-[0-9a-f]{12}$/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("the recording name changes when the text changes", async () => {
    const m = load({ TTS_URL: "http://piper", ...key });
    m.apiFetch.mockResolvedValue(ok("u"));
    await m.ttsPrompt("one", "exponat", "7");
    await m.ttsPrompt("two", "exponat", "7");
    expect(m.apiFetch.mock.calls[0][0][3]).not.toBe(
      m.apiFetch.mock.calls[1][0][3],
    );
  });

  it("synthesises with Piper and uploads the result", async () => {
    const m = load({ TTS_URL: "http://piper/", ...key });
    m.apiFetch
      .mockResolvedValueOnce({ ok: false }) // nothing stored yet
      .mockResolvedValueOnce(ok("http://files/new")); // upload result
    fetchMock.mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
    });

    await expect(m.ttsPrompt("hello", "post", "9")).resolves.toBe(
      "http://files/new",
    );

    expect(fetchMock.mock.calls[0][0]).toBe("http://piper/synthesize");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      text: "hello",
    });
    const upload = m.apiFetch.mock.calls[1][1];
    expect(upload.method).toBe("POST");
    expect(upload.headers).toEqual({ "x-internal-key": "internal" });
    expect(upload.body.get("file").type).toBe("audio/wav");
  });

  it("only looks up stored recordings without the internal key", async () => {
    const m = load({ TTS_URL: "http://piper" });
    m.apiFetch.mockResolvedValueOnce(ok("http://files/audio"));
    await expect(m.ttsPrompt("hello", "post", "9")).resolves.toBe(
      "http://files/audio",
    );
    m.apiFetch.mockResolvedValueOnce({ ok: false });
    await expect(m.ttsPrompt("hello", "post", "9")).resolves.toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(m.apiFetch).toHaveBeenCalledTimes(2); // no upload attempted
  });

  it("uses Google text-to-speech when only a Google key is set", async () => {
    const m = load({ GOOGLE_CLOUD_API_KEY: "g-key", ...key });
    m.apiFetch
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce(ok("u"));
    fetchMock.mockResolvedValue({
      json: async () => ({
        audioContent: Buffer.from("pcm").toString("base64"),
      }),
    });
    await m.ttsPrompt("hello", "post", "9");
    expect(fetchMock.mock.calls[0][0]).toContain("texttospeech.googleapis.com");
    expect(fetchMock.mock.calls[0][0]).toContain("key=g-key");
  });

  it.each([
    ["Piper fails", { ok: false }],
    ["Google returns no audio", { json: async () => ({}) }],
  ])("gives up quietly when %s", async (_n, response) => {
    const m = load(
      _n === "Piper fails"
        ? { TTS_URL: "http://piper", ...key }
        : { GOOGLE_CLOUD_API_KEY: "k", ...key },
    );
    m.apiFetch.mockResolvedValue({ ok: false });
    fetchMock.mockResolvedValue(response);
    await expect(m.ttsPrompt("hello", "post", "9")).resolves.toBeUndefined();
    expect(m.apiFetch).toHaveBeenCalledTimes(1); // no upload attempted
  });

  it("returns undefined when the upload is rejected or the API is down", async () => {
    const m = load({ TTS_URL: "http://piper", ...key });
    fetchMock.mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(2),
    });
    m.apiFetch
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: false });
    await expect(m.ttsPrompt("a", "post", "1")).resolves.toBeUndefined();

    m.apiFetch.mockReset();
    m.apiFetch.mockRejectedValue(new Error("down"));
    await expect(m.ttsPrompt("a", "post", "1")).resolves.toBeUndefined();
  });
});

export {};
