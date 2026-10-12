"use client";
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { blobToBase64 } from "../static/blobToBase64";
import { createMediaStream } from "../static/createMediaStream";
import { isSpeechToTextConfigured, whisperPrompt } from "@/api/AI";

// Asked once per page; the answer cannot change while the server runs.
let serverTranscribes: Promise<boolean> | undefined;
const canServerTranscribe = () =>
  (serverTranscribes ??= isSpeechToTextConfigured().catch(() => false));

const getBrowserRecognition = () =>
  typeof window === "undefined"
    ? undefined
    : (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

export const useRecordVoice = () => {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recognition = useRef<any>(null);
  const isRecording = useRef(false);
  const chunks = useRef([]);

  const getText = async (base64data: any) => {
    try {
      const response = await whisperPrompt(base64data);
      const { text } = response!;
      setText(text);
    } catch (error) {
      console.log(error);
    }
  };

  const createMediaRecorder = (stream: MediaStream) => {
    const recorder = new MediaRecorder(stream);

    recorder.onstart = () => {
      createMediaStream(stream);
      chunks.current = [];
    };

    recorder.ondataavailable = (ev) => {
      chunks.current.push(ev.data as never);
    };

    recorder.onstop = () => {
      const audioBlob = new Blob(chunks.current, { type: "audio/wav" });
      blobToBase64(audioBlob, getText);
    };

    return recorder;
  };

  // The microphone is requested on first use, not when the input mounts, so
  // pages with a text field do not prompt for it on load.
  const getMediaRecorder = async () => {
    if (!mediaRecorder.current) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = createMediaRecorder(stream);
    }
    return mediaRecorder.current;
  };

  // Backup when the server has no OPENAI_API_KEY: the browser's own speech
  // recognition, where it exists (Chromium and Safari).
  const startBrowserRecognition = () => {
    const Recognition = getBrowserRecognition();
    if (!Recognition) {
      isRecording.current = false;
      toast.error("Prepoznavanje govora nije dostupno u ovom pregledniku");
      return;
    }

    const session = new Recognition();
    session.lang = "hr-HR";
    session.onresult = (event: any) => setText(event.results[0][0].transcript);
    session.onend = () => setRecording(false);
    session.onerror = () => setRecording(false);
    recognition.current = session;
    session.start();
    setRecording(true);
  };

  const startRecording = async () => {
    isRecording.current = true;
    try {
      if (!(await canServerTranscribe())) {
        if (isRecording.current) startBrowserRecognition();
        return;
      }
      const recorder = await getMediaRecorder();
      // The button may have been released while the permission prompt was open.
      if (!isRecording.current || recorder.state === "recording") return;
      recorder.start();
      setRecording(true);
    } catch (error) {
      isRecording.current = false;
      console.log(error);
    }
  };

  const stopRecording = () => {
    isRecording.current = false;
    recognition.current?.stop();
    recognition.current = null;
    if (mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  };

  return { recording, startRecording, stopRecording, text };
};
