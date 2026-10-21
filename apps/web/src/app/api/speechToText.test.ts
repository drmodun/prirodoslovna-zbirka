jest.mock("./AI", () => ({
  isSpeechToTextConfigured: jest.fn(),
  whisperPrompt: jest.fn(),
}));
jest.mock("./getUrlServer", () => ({ apiFetch: jest.fn() }));

import { isSpeechToTextConfigured, transcribe } from "./speechToText";
import * as ai from "./AI";
import { apiFetch } from "./getUrlServer";

const whisperPrompt = ai.whisperPrompt as jest.Mock;
const fetchApi = apiFetch as jest.Mock;

describe("speechToText actions", () => {
  it("passes the capability check through", async () => {
    (ai.isSpeechToTextConfigured as jest.Mock).mockResolvedValue(true);
    await expect(isSpeechToTextConfigured()).resolves.toBe(true);
  });

  it("transcribes for a logged-in user, returning only the text", async () => {
    fetchApi.mockResolvedValue({ ok: true });
    whisperPrompt.mockResolvedValue({ text: "dobar dan", usage: {} });

    await expect(transcribe("BASE64", "TOKEN")).resolves.toEqual({
      text: "dobar dan",
    });
    expect(fetchApi).toHaveBeenCalledWith(["auth", "me"], {
      headers: { Authorization: "Bearer TOKEN" },
      cache: "no-store",
    });
    expect(whisperPrompt).toHaveBeenCalledWith("BASE64");
  });

  it("refuses without a valid login", async () => {
    await expect(transcribe("BASE64", "")).resolves.toBeUndefined();
    expect(fetchApi).not.toHaveBeenCalled();

    fetchApi.mockResolvedValue({ ok: false });
    await expect(transcribe("BASE64", "expired")).resolves.toBeUndefined();
    expect(whisperPrompt).not.toHaveBeenCalled();
  });

  it("refuses arguments that are not strings", async () => {
    await expect(
      transcribe({ not: "audio" } as any, "TOKEN"),
    ).resolves.toBeUndefined();
    expect(fetchApi).not.toHaveBeenCalled();
  });
});
