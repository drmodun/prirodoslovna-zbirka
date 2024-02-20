"use client";
import { useState } from "react";
import classes from "./BaseButton.module.scss";
import clsx from "clsx";
import { ButtonColor } from "@/shared/enums";

export type BaseButtonPros = {
  text: string;
  onClick?: () => void;
  initColor?: ButtonColor;
  isNotSubmit?: boolean;
  className?: string;
};

export const BaseButton = ({
  text,
  initColor = ButtonColor.GREEN,
  isNotSubmit,
  className,
}: BaseButtonPros) => {
  return (
    <button
      type={isNotSubmit ? "button" : "submit"}
      className={clsx(classes.button, classes[initColor], className)}
    >
      {text}
    </button>
  );
};
