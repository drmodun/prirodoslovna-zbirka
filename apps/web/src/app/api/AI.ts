"use server";

import next from "next";
import { OpenAI } from "openai";
const fs = require("fs");
import { Readable } from "stream";
import { getBaseUrl } from "./getUrlServer";
import { headers } from "next/headers";

const key = process.env.OPENAI_API_KEY;
const gptUrl = "https://api.openai.com/v1/chat/completions";

const googleKey = process.env.GOOGLE_CLOUD_API_KEY;
const ttsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleKey}`;

const s3Path = process.env.S3_PATH;

const openai = new OpenAI({
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

export const exponatInfoPrompt = async (exponat: any) => {
  if (!key) return;

  const prompt = `You are a biology expert. Like a teacher, tell me some interesting and essential information about ${exponat}. Write about the characteristics od this species and mention the most important known things. Below the essay list your used sources Keep it structured in one paragraph, at about 200 (+/- 10%) words, the answer has to be written in croatian.`;

  const response = await getGPT(prompt);
  console.log(response.choices[0].message);
  return response.choices[0].message.content;
};

export const summarisePostPrompt = async (title: string, content: string) => {
  if (!key) return;

  const prompt = `You are a biology expert. Like a teacher, summarise the post about ${title}. The post is: ${content}. Write about the main points and the most important information. Keep it structured in one paragraph, at about 1/5 to 1/3 of the words of the original posts, the answer has to be written in croatian.`;

  const response = await getGPT(prompt);
  console.log(response.choices[0].message);
  return response.choices[0].message.content;
};

export const whisperPrompt = async (audio: any) => {
  const buffer = Buffer.from(audio, "base64");
  if (!key) return;

  try {
    const file = new File([buffer], "input.wav", { type: "audio/wav" });
    openai.apiKey = key!;

    const response = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "hr",
    });

    console.log(response);

    return response;
  } catch (error) {
    console.log(error);
  }
};

export const ttsPrompt = async (
  text: string,
  directory: string,
  id: string
) => {
  const body = {
    input: { text: text },
    voice: { languageCode: "sr-RS", name: "sr-RS-Standard-A" },
    audioConfig: { audioEncoding: "LINEAR16", pitch: 0 },
  };

  const exists = await fetch(`${s3Path}audio-${directory}/${id}`, {
    method: "HEAD",
  });

  if (exists.ok) {
    console.log("exists");
    return `${s3Path}audio-${directory}/${id}`;
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

    console.log(`${getBaseUrl()}/blobs/audio/audio-${directory}/${id}`);

    const url = await fetch(`${getBaseUrl()}/blobs/audio/audio-${directory}/${id}`, {
      method: "POST",
      body: request,
    });

    const data = await url.text();
    console.log(data, "sdad");

    return data;
  } catch (error) {
    console.log("sd", error);
  }
};
