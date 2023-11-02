import { useState } from "react";
import classes from "./BaseButton.module.scss";
import clsx from "clsx";

export interface BaseButtonPros {
  text: string;
  onClick: () => void;
  initColor?: ButtonColor;
}

export const BaseButton = ({
  text,
  onClick,
  initColor = ButtonColor.GREEN,
}: BaseButtonPros) => {
  return (
    <button
      className={clsx(classes.button, classes[initColor])}
      onClick={onClick}
    >
      {text}
    </button>
  );
};
