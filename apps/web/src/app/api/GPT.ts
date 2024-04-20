"use server";

import next from "next";
import { OpenAI } from "openai";
const fs = require("fs");
import { Readable } from "stream";

const key = process.env.OPENAI_API_KEY;
const gptUrl = "https://api.openai.com/v1/chat/completions";

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
        max_tokens: 400,
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

export const whisperPrompt = async (audio: any) => {
  const buffer = Buffer.from(audio, "base64");
  const filePath = "./tmp/input.wav";
  if (!key) return;

  try {
    const readStream = Readable.from(buffer);
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
