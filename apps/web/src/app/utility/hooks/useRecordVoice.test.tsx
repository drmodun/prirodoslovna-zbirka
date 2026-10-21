// The hook memoises a promise at module level, so every test loads a fresh
// module graph. React and Testing Library must be reloaded with it, otherwise
// the hook would run against a different React instance than the renderer.
let rtl: typeof import("@testing-library/react");
const renderHook: typeof import("@testing-library/react").renderHook = (
  ...a: any[]
) => (rtl.renderHook as any)(...a);
const act: typeof import("@testing-library/react").act = ((...a: any[]) =>
  (rtl.act as any)(...a)) as any;
const waitFor: typeof import("@testing-library/react").waitFor = (
  ...a: any[]
) => (rtl.waitFor as any)(...a);

jest.mock("@/api/speechToText", () => ({
  isSpeechToTextConfigured: jest.fn(),
  transcribe: jest.fn(),
}));
jest.mock("../static/createMediaStream", () => ({
  createMediaStream: jest.fn(),
}));
jest.mock("../static/blobToBase64", () => ({
  blobToBase64: jest.fn((_blob: Blob, cb: (data: string) => void) =>
    cb("BASE64"),
  ),
}));

class FakeRecorder {
  static last: FakeRecorder;
  state: "inactive" | "recording" = "inactive";
  onstart?: () => void;
  ondataavailable?: (e: { data: string }) => void;
  onstop?: () => void;
  constructor(public stream: unknown) {
    FakeRecorder.last = this;
  }
  start() {
    this.state = "recording";
    this.onstart?.();
  }
  stop() {
    this.state = "inactive";
    this.ondataavailable?.({ data: "chunk" });
    this.onstop?.();
  }
}

/** The hook memoises the server capability at module level: load it fresh. */
const load = (serverTranscribes: boolean | Error) => {
  jest.resetModules();
  // "pure" does not register its own auto-cleanup hooks (not allowed in a test)
  rtl = require("@testing-library/react/pure");
  const ai = require("@/api/speechToText");
  if (serverTranscribes instanceof Error)
    ai.isSpeechToTextConfigured.mockRejectedValue(serverTranscribes);
  else ai.isSpeechToTextConfigured.mockResolvedValue(serverTranscribes);
  const { useRecordVoice } = require("./useRecordVoice");
  const toast = require("react-hot-toast").default;
  return { useRecordVoice, ai, toast };
};

afterEach(() => rtl?.cleanup());

const getUserMedia = jest.fn();
beforeEach(() => {
  (global as any).MediaRecorder = FakeRecorder;
  getUserMedia.mockResolvedValue({ id: "stream" });
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia },
  });
  delete (window as any).SpeechRecognition;
  delete (window as any).webkitSpeechRecognition;
});

describe("useRecordVoice with server side transcription", () => {
  beforeEach(() => localStorage.setItem("access_token", "TOKEN"));
  afterEach(() => localStorage.clear());

  it("only asks for the microphone when recording starts", async () => {
    const { useRecordVoice } = load(true);
    const { result } = renderHook(() => useRecordVoice());
    expect(getUserMedia).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.startRecording();
    });
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(result.current.recording).toBe(true);
  });

  it("transcribes the recording when it stops", async () => {
    const { useRecordVoice, ai } = load(true);
    ai.transcribe.mockResolvedValue({ text: "dobar dan" });
    const { result } = renderHook(() => useRecordVoice());

    await act(async () => {
      await result.current.startRecording();
    });
    act(() => result.current.stopRecording());

    await waitFor(() => expect(result.current.text).toBe("dobar dan"));
    expect(ai.transcribe).toHaveBeenCalledWith("BASE64", "TOKEN");
    expect(result.current.recording).toBe(false);
  });

  it("reuses the recorder and does not start twice", async () => {
    const { useRecordVoice } = load(true);
    const { result } = renderHook(() => useRecordVoice());
    await act(async () => {
      await result.current.startRecording();
      await result.current.startRecording();
    });
    expect(getUserMedia).toHaveBeenCalledTimes(1);
  });

  it("does not start when the button was released during the permission prompt", async () => {
    const { useRecordVoice } = load(true);
    let release!: (stream: unknown) => void;
    getUserMedia.mockReturnValue(new Promise((r) => (release = r)));
    const { result } = renderHook(() => useRecordVoice());

    let started: Promise<void>;
    act(() => {
      started = result.current.startRecording();
    });
    act(() => result.current.stopRecording());
    await act(async () => {
      release({});
      await started;
    });
    expect(result.current.recording).toBe(false);
  });

  it("survives a denied microphone permission", async () => {
    const { useRecordVoice } = load(true);
    getUserMedia.mockRejectedValue(new Error("denied"));
    const { result } = renderHook(() => useRecordVoice());
    await act(async () => {
      await result.current.startRecording();
    });
    expect(result.current.recording).toBe(false);
  });

  it("keeps the previous text when transcription fails", async () => {
    const { useRecordVoice, ai } = load(true);
    ai.transcribe.mockResolvedValue(undefined);
    const { result } = renderHook(() => useRecordVoice());
    await act(async () => {
      await result.current.startRecording();
    });
    act(() => result.current.stopRecording());
    await new Promise((r) => setTimeout(r, 10));
    expect(result.current.text).toBe("");
  });
});

describe("useRecordVoice without server transcription", () => {
  class FakeRecognition {
    static last: FakeRecognition;
    lang = "";
    onresult?: (e: any) => void;
    onend?: () => void;
    onerror?: () => void;
    start = jest.fn();
    stop = jest.fn();
    constructor() {
      FakeRecognition.last = this;
    }
  }

  it("uses the browser's speech recognition in Croatian", async () => {
    (window as any).SpeechRecognition = FakeRecognition;
    const { useRecordVoice } = load(false);
    const { result } = renderHook(() => useRecordVoice());

    await act(async () => {
      await result.current.startRecording();
    });
    expect(FakeRecognition.last.lang).toBe("hr-HR");
    expect(FakeRecognition.last.start).toHaveBeenCalled();
    expect(result.current.recording).toBe(true);
    expect(getUserMedia).not.toHaveBeenCalled();

    act(() =>
      FakeRecognition.last.onresult!({
        results: [[{ transcript: "bok svima" }]],
      }),
    );
    expect(result.current.text).toBe("bok svima");

    act(() => FakeRecognition.last.onend!());
    expect(result.current.recording).toBe(false);
  });

  it("works with the webkit prefix and stops the session", async () => {
    (window as any).webkitSpeechRecognition = FakeRecognition;
    const { useRecordVoice } = load(false);
    const { result } = renderHook(() => useRecordVoice());
    await act(async () => {
      await result.current.startRecording();
    });
    act(() => result.current.stopRecording());
    expect(FakeRecognition.last.stop).toHaveBeenCalled();
  });

  it("tells the user when no recognition is available", async () => {
    const { useRecordVoice, toast } = load(false);
    const { result } = renderHook(() => useRecordVoice());
    await act(async () => {
      await result.current.startRecording();
    });
    expect(toast.error).toHaveBeenCalled();
    expect(result.current.recording).toBe(false);
  });

  it("uses the browser's recognition when nobody is logged in", async () => {
    (window as any).SpeechRecognition = FakeRecognition;
    const { useRecordVoice, ai } = load(true);
    const { result } = renderHook(() => useRecordVoice());
    await act(async () => {
      await result.current.startRecording();
    });
    expect(FakeRecognition.last.start).toHaveBeenCalled();
    expect(getUserMedia).not.toHaveBeenCalled();
    expect(ai.transcribe).not.toHaveBeenCalled();
  });

  it("treats a failing capability check as 'no server transcription'", async () => {
    (window as any).SpeechRecognition = FakeRecognition;
    localStorage.setItem("access_token", "TOKEN");
    const { useRecordVoice } = load(new Error("server down"));
    const { result } = renderHook(() => useRecordVoice());
    await act(async () => {
      await result.current.startRecording();
    });
    expect(FakeRecognition.last.start).toHaveBeenCalled();
    localStorage.clear();
  });
});

export {};
