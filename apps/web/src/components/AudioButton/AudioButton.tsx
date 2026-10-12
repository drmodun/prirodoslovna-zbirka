"use client";

import { useEffect, useRef, useState } from "react";
import classes from "./AudioButton.module.scss";
import clsx from "clsx";
import Image from "next/image";
import playIcon from "assets/icons/play.svg";
import pauseIcon from "assets/icons/pause.svg";

export interface AudioButtonProps {
  src?: string;
  // Read aloud by the browser's speech synthesis when there is no recording.
  text?: string;
  onPlay?: (e: any) => void;
}

export const AudioButton = ({ src, text, onPlay }: AudioButtonProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const ref = useRef<HTMLAudioElement>(null);

  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hr-HR";
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const play = () => {
    src ? ref.current!.play() : speak();
    setIsPlaying(true);
  };

  const stop = () => {
    src ? ref.current!.pause() : window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  useEffect(() => {
    if (src) return;
    return () => window.speechSynthesis?.cancel();
  }, [src]);

  const handleClick = () => {
    isPlaying ? stop() : play();
  };
  return (
    <div className={classes.container}>
      {src && <audio ref={ref} src={src} onPlay={onPlay} />}
      <button
        title={!isPlaying ? "play" : "pause"}
        className={clsx(classes.play, isPlaying && classes.playing)}
        onClick={handleClick}
      >
        <Image
          alt={!isPlaying ? "play" : "pause"}
          src={!isPlaying ? playIcon : pauseIcon}
        />
      </button>
    </div>
  );
};
