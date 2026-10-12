"use client";
import { useState, useRef } from "react";
import { blobToBase64 } from "../static/blobToBase64";
import { createMediaStream } from "../static/createMediaStream";
import { whisperPrompt } from "@/api/AI";
export const useRecordVoice = () => {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
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

  const startRecording = async () => {
    isRecording.current = true;
    try {
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
    if (mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  };

  return { recording, startRecording, stopRecording, text };
};
