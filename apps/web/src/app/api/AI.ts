"use server";

import { OpenAI } from "openai";
import { filesUrl, getBaseUrl } from "./getUrlServer";

const key = process.env.OPENAI_API_KEY;
const gptUrl = "https://api.openai.com/v1/chat/completions";

const googleKey = process.env.GOOGLE_CLOUD_API_KEY;
const ttsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleKey}`;

const s3Path = process.env.S3_PATH;

const openai =
  key &&
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

const options = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  },
  method: "POST",
};

//General function to get GPT-3 completions

export const getGPT = async (prompt: string) => {
  if (!key) return;
  try {
    const response = await fetch(gptUrl, {
      ...options,
      body: JSON.stringify({
        model: "gpt-3.5-turbo-0125",
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
  "Opis trenutno nije dostupan. Za AI generirani opis potrebno je postaviti OPENAI_API_KEY.";

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
  if (!key) return;
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
export const isSpeechToTextConfigured = async () => !!key;

export const whisperPrompt = async (audio: any) => {
  const buffer = Buffer.from(audio, "base64");
  if (!key) return;

  try {
    const file = new File([buffer], "input.wav", { type: "audio/wav" });
    if (!key || !openai) return;

    openai.apiKey = key;

    const response = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "hr",
    });

    return response;
  } catch (error) {
    console.log(error);
  }
};

export const ttsPrompt = async (
  text: string,
  directory: string,
  id: string,
) => {
  const body = {
    input: { text: text },
    voice: { languageCode: "sr-RS", name: "sr-RS-Standard-A" },
    audioConfig: { audioEncoding: "LINEAR16", pitch: 0 },
  };

  // Without a Google key nothing is synthesised here; the audio button reads
  // the text with the browser's speech synthesis instead.
  if (!googleKey || !text) return;

  // Synthesised audio is cached in file storage: S3 when configured, else
  // the API's local storage.
  const stored = `audio-${directory}/${id}`;
  try {
    const exists = await fetch(
      `${s3Path || `${getBaseUrl()}/blobs/file/`}${stored}`,
      { method: "HEAD", cache: "no-store" },
    );
    if (exists.ok) return `${s3Path || `${filesUrl}/`}${stored}`;
  } catch (error) {
    console.log(error);
  }

  try {
    const response = await fetch(ttsUrl, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const audio = await response.json();
    const buffer = Buffer.from(audio.audioContent, "base64");
    const file = new File([buffer], `${id}.wav`, { type: "audio/wav" });
    const request = new FormData();
    request.append("file", file);

    const url = await fetch(
      `${getBaseUrl()}/blobs/audio/audio-${directory}/${id}`,
      {
        method: "POST",
        body: request,
      },
    );

    if (!url.ok) return;
    return await url.text();
  } catch (error) {
    console.log(error);
  }
};
