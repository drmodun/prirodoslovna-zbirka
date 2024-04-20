"use client";

import { useRef, useState } from "react";
import classes from "./AudioButton.module.scss";
import clsx from "clsx";
import Image from "next/image";
import playIcon from "assets/icons/play.svg";
import pauseIcon from "assets/icons/pause.svg";

export interface AudioButtonProps {
  src: string;
  onPlay?: (e: any) => void;
}

export const AudioButton = ({ src, onPlay }: AudioButtonProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const ref = useRef<HTMLAudioElement>(null);

  const play = () => {
    ref.current!.play();
    setIsPlaying(true);
  };

  const stop = () => {
    ref.current!.pause();
    setIsPlaying(false);
  };

  const handleClick = () => {
    isPlaying ? stop() : play();
  };
  return (
    <div className={classes.container}>
      <audio ref={ref} src={src} onPlay={onPlay} />
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
