---
title: AI and speech
description: Generated descriptions and summaries, text to speech and voice input, and their offline fallbacks.
sidebar:
  order: 8
---

Biosfera uses three kinds of optional service. All of them run on the **web
server** as Next.js server actions in `apps/web/src/app/api/AI.ts`, so keys
never reach the browser, and every one of them has a fallback that works with
no configuration at all.

| Feature | Service | Fallback |
| ------- | ------- | -------- |
| Exponat description | Any OpenAI-compatible chat API | Wikipedia lead paragraph (hr, then en) |
| Post summary | Same | The post's opening sentences |
| Read aloud | Piper (`TTS_URL`) or Google Cloud TTS | Browser speech synthesis |
| Voice input | OpenAI-compatible transcription (`whisper-1`) | Browser speech recognition |

## Text generation

`getGPT(prompt)` posts to `${OPENAI_BASE_URL}/chat/completions` with
`OPENAI_MODEL` and `max_tokens: 2000`, using Next's `force-cache` so the same
prompt is not sent twice. AI is on when either `OPENAI_API_KEY` or
`OPENAI_BASE_URL` is set; the latter alone is enough for keyless local
servers such as Ollama.

- **`exponatInfoPrompt(name)`** asks, in English, for a ~200-word Croatian
  paragraph about the species, written like a teacher would, with sources.
  It is called with the exponat's `alternateName` every time the page
  renders (cached by Next), not stored.
  Without AI, `wikipediaSummary` fetches
  `https://<hr|en>.wikipedia.org/api/rest_v1/page/summary/<title>` (cached
  for a week) and appends the source link. If both fail the page says the
  description is not available.
- **`summarisePostPrompt(title, content)`** asks for a Croatian summary of a
  fifth to a third of the post's length. Without AI, `leadSentences` strips
  HTML and Markdown and keeps whole sentences up to about a quarter of the
  text (at least 200 characters).

## Text to speech

`ttsPrompt(text, directory, id)` returns the URL of a recording, or
`undefined`.

1. The recording's name is `<id>-<first 12 hex chars of sha1(text)>` in
   `audio-<directory>`. Editing the text gives it a new name, so stale audio
   is never played.
2. `GET /blobs/audio/<dir>/<name>`: if it exists, its URL is returned.
3. Otherwise the text is synthesised:
   - **Piper**, if `TTS_URL` is set: `POST <TTS_URL>/synthesize` with
     `{ text }`, returns WAV. Compose runs `docker/piper` with the
     `sr_RS-serbski_institut-medium` voice (Serbian is the closest available
     to Croatian).
   - **Google Cloud**, if `GOOGLE_CLOUD_API_KEY` is set: voice
     `sr-RS-Standard-A`, LINEAR16.
4. The WAV is uploaded with `POST /blobs/audio/<dir>/<name>` and its URL
   returned.

When nothing is configured, or anything fails, `AudioButton` falls back to
the browser's `speechSynthesis`.

### The Piper image

`docker/piper/Dockerfile` installs `piper-tts[http]` (pinned to 1.8.0),
downloads the voice named by the `PIPER_VOICE` build argument at build time,
and runs `python -m piper.http_server` on port 5000 as an unprivileged user.
Any Piper voice id works; rebuild the image after changing it.

## Voice input

Text inputs and text areas offer a microphone button (`SpeechToText`, `useRecordVoice`).

- `isSpeechToTextConfigured()` tells the client whether the server can
  transcribe: AI must be enabled and `OPENAI_TRANSCRIPTION_MODEL` non-empty.
- If yes, the browser records with `MediaRecorder`, sends base64 audio to
  `whisperPrompt`, which calls `audio.transcriptions.create` with
  `language: "hr"`.
- If not, it uses the browser's `SpeechRecognition` (Chrome, Edge, Safari)
  directly.

Many OpenAI-compatible providers have no transcription endpoint; set
`OPENAI_TRANSCRIPTION_MODEL=` (empty) for them so the browser fallback is
used instead of failing requests.
