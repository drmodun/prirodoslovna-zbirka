import hashtag from "assets/icons/hashtag.svg";
import Image from "next/image";
import { useState } from "react";
import SerialModal from "../../../SerialModal";
import classes from "./SerialButton.module.scss";

export const SerialButton = () => {
  const [isOpen, setOpen] = useState(false);

  const close = () => {
    setOpen(false);
  };

  const open = () => {
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        title="seriski broj"
        onClick={open}
        className={classes.serialButton}
      >
        <figure>#</figure>
      </button>
      <SerialModal isOpen={isOpen} onClose={close} />
    </>
  );
};
