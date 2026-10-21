"use server";

// The only AI functions the browser may call. Each export here is a public
// endpoint that anyone can call with any arguments, so keep it to these two.
import {
  isSpeechToTextConfigured as serverTranscribes,
  whisperPrompt,
} from "./AI";
import { apiFetch } from "./getUrlServer";

export const isSpeechToTextConfigured = async () => serverTranscribes();

// Transcription is paid for, so it is only done for logged-in users: the
// token is checked with the API first. Without one the browser's own speech
// recognition is used instead (see useRecordVoice).
export const transcribe = async (audio: string, token: string) => {
  if (typeof audio !== "string" || typeof token !== "string" || !token) return;

  const me = await apiFetch(["auth", "me"], {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!me.ok) return;

  const transcription = await whisperPrompt(audio);
  return transcription && { text: transcription.text };
};
