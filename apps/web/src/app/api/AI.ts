"use server";

import { createHash } from "crypto";
import { OpenAI } from "openai";
import { apiUrl } from "./getUrlServer";

// Any OpenAI-compatible API: OpenAI itself, OpenRouter, Groq, Mistral, or a
// local server such as Ollama or LM Studio.
const ai = {
  key: process.env.OPENAI_API_KEY,
  baseUrl: (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(
    /\/+$/,
    "",
  ),
  model: process.env.OPENAI_MODEL || "gpt-3.5-turbo-0125",
  // Empty disables server-side transcription, for providers without one.
  transcriptionModel: process.env.OPENAI_TRANSCRIPTION_MODEL ?? "whisper-1",
};
// Local servers usually need no key, so a custom address is enough.
const aiEnabled = !!(ai.key || process.env.OPENAI_BASE_URL);

const openai =
  aiEnabled && new OpenAI({ apiKey: ai.key || "none", baseURL: ai.baseUrl });

// Text-to-speech: a Piper HTTP server if TTS_URL is set, else Google Cloud.
const piperUrl = process.env.TTS_URL?.replace(/\/+$/, "");
const googleKey = process.env.GOOGLE_CLOUD_API_KEY;
const googleTtsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleKey}`;

//General function to get chat completions

export const getGPT = async (prompt: string) => {
  if (!aiEnabled) return;
  try {
    const response = await fetch(`${ai.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(ai.key && { Authorization: `Bearer ${ai.key}` }),
      },
      body: JSON.stringify({
        model: ai.model,
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
      cache: "force-cache",
    });

    return response.json();
  } catch (error) {
    console.log(error);
  }
};

const WIKIPEDIA_LANGUAGES = ["hr", "en"];
const NO_DESCRIPTION =
  "Opis trenutno nije dostupan. Za AI generirani opis potrebno je postaviti AI servis (OPENAI_API_KEY).";

// Backup for the AI description: the lead paragraph of the Wikipedia article,
// Croatian first.
const wikipediaSummary = async (title: string) => {
  for (const language of WIKIPEDIA_LANGUAGES) {
    try {
      const response = await fetch(
        `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          title.trim().replace(/ /g, "_"),
        )}`,
        { next: { revalidate: 60 * 60 * 24 * 7 } },
      );
      if (!response.ok) continue;
      const page = await response.json();
      if (page.type === "standard" && page.extract)
        return `${page.extract}\n\nIzvor: ${page.content_urls?.desktop?.page ?? `${language}.wikipedia.org`}`;
    } catch (error) {
      console.log(error);
    }
  }
};

// Backup for the AI summary: the opening sentences of the post, up to roughly
// a quarter of its length.
const leadSentences = (content: string) => {
  const text = content
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_>`~]|!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  const limit = Math.max(200, Math.round(text.length / 4));
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];

  let summary = "";
  for (const sentence of sentences) {
    if (summary && summary.length + sentence.length > limit) break;
    summary += sentence;
  }
  return summary.trim();
};

const askGPT = async (prompt: string): Promise<string | undefined> => {
  const response = await getGPT(prompt);
  return response?.choices?.[0]?.message?.content;
};

export const exponatInfoPrompt = async (exponat: any) => {
  const prompt = `You are a biology expert. Like a teacher, tell me some interesting and essential information about the ${exponat}. Write about the characteristics od this species and mention the most important known things. Use official sources, possibly query info from GBIF, and list all used sources below (check that links actually exist). Keep it structured in one paragraph, at about 200 (+/- 10%) words, the answer has to be written in croatian.`;

  return (
    (await askGPT(prompt)) ??
    (await wikipediaSummary(String(exponat))) ??
    NO_DESCRIPTION
  );
};

export const summarisePostPrompt = async (title: string, content: string) => {
  const prompt = `You are a biology expert. Like a teacher, summarise the post about ${title}. The post is: ${content}. Write about the main points and the most important information. Keep it structured in one paragraph, at about 1/5 to 1/3 of the words of the original posts, the answer has to be written in croatian.`;

  return (await askGPT(prompt)) ?? leadSentences(content);
};

// Lets the client pick the browser's own speech recognition when the server
// cannot transcribe.
export const isSpeechToTextConfigured = async () =>
  aiEnabled && !!ai.transcriptionModel;

export const whisperPrompt = async (audio: any) => {
  if (!openai || !ai.transcriptionModel) return;

  try {
    const buffer = Buffer.from(audio, "base64");
    const file = new File([buffer], "input.wav", { type: "audio/wav" });

    const response = await openai.audio.transcriptions.create({
      file: file,
      model: ai.transcriptionModel,
      language: "hr",
    });

    return response;
  } catch (error) {
    console.log(error);
  }
};

const synthesise = async (text: string): Promise<Buffer | undefined> => {
  if (piperUrl) {
    const response = await fetch(`${piperUrl}/synthesize`, {
      method: "POST",
      body: JSON.stringify({ text }),
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!response.ok) return;
    return Buffer.from(await response.arrayBuffer());
  }

  const response = await fetch(googleTtsUrl, {
    method: "POST",
    body: JSON.stringify({
      input: { text: text },
      voice: { languageCode: "sr-RS", name: "sr-RS-Standard-A" },
      audioConfig: { audioEncoding: "LINEAR16", pitch: 0 },
    }),
    headers: { "Content-Type": "application/json" },
  });
  const audio = await response.json();
  if (!audio.audioContent) return;
  return Buffer.from(audio.audioContent, "base64");
};

// Resolves to the URL of a recording of `text`, synthesising and storing it
// on first request. Undefined when no speech service is configured or it
// fails; the audio button then reads the text with the browser instead.
export const ttsPrompt = async (
  text: string,
  directory: string,
  id: string,
) => {
  if (!text || !(piperUrl || googleKey)) return;

  // The name carries a hash of the text, so an edited post or a regenerated
  // description gets a new recording instead of the stale one.
  const hash = createHash("sha1").update(text).digest("hex").slice(0, 12);
  const stored = apiUrl([
    "blobs",
    "audio",
    `audio-${directory}`,
    `${id}-${hash}`,
  ]);

  try {
    const existing = await fetch(stored, {
      cache: "no-store",
    });
    if (existing.ok) return await existing.text();

    const audio = await synthesise(text);
    if (!audio) return;

    const request = new FormData();
    request.append(
      "file",
      new File([new Uint8Array(audio)], `${id}.wav`, { type: "audio/wav" }),
    );

    const upload = await fetch(stored, {
      method: "POST",
      body: request,
    });
    if (!upload.ok) return;
    return await upload.text();
  } catch (error) {
    console.log(error);
  }
};
