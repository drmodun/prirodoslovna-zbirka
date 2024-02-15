"use client";
import { useState } from "react";
import classes from "./BaseButton.module.scss";
import clsx from "clsx";
import { ButtonColor } from "@/shared/enums";

export interface BaseButtonPros {
  text: string;
  onClick?: () => void;
  initColor?: ButtonColor;
  isNotSubmit?: boolean;
}

export const BaseButton = ({
  text,
  onClick,
  initColor = ButtonColor.GREEN,
  isNotSubmit,
}: BaseButtonPros) => {
  return (
    <button
      type={isNotSubmit ? "button" : "submit"}
      className={clsx(classes.button, classes[initColor])}
      onClick={onClick}
    >
      {text}
    </button>
  );
};
