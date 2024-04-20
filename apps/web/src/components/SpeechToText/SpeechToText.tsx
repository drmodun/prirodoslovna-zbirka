"use client";

import { useRecordVoice } from "@/utility/hooks/useRecordVoice";
import classes from "./SpeechToText.module.scss";
import Image from "next/image";
import microphone from "assets/icons/microphone.svg";
import { useEffect } from "react";

export interface SpeechToTextProps {
  onText?: (text: string) => void;
}

export const SpeechToText = ({ onText }: SpeechToTextProps) => {
  const { startRecording, stopRecording, text } = useRecordVoice();

  useEffect(() => {
    if (text) {
      console.log(text);
      onText && onText(text);
    }
  }, [text]);

  return (
    <button
      title="Započni snimanje"
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onTouchStart={startRecording}
      onTouchEnd={stopRecording}
      className={classes.container}
    >
      <div className={classes.icon}>
        <Image src={microphone} alt="microphone" layout="fill" />
      </div>
    </button>
  );
};
