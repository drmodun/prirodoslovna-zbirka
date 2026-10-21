"use client";

import { useRecordVoice } from "@/utility/hooks/useRecordVoice";
import classes from "./SpeechToText.module.scss";
import Image from "next/image";
import microphone from "assets/icons/microphone.svg";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

export interface SpeechToTextProps {
  onText?: (text: string) => void;
}

export const SpeechToText = ({ onText }: SpeechToTextProps) => {
  const t = useTranslations("SpeechToText");
  const { startRecording, stopRecording, text } = useRecordVoice();

  useEffect(() => {
    if (text) {
      console.log(text);
      onText && onText(text);
    }
  }, [text]);

  return (
    <button
      type="button"
      title={t("record")}
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
