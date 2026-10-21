import hashtag from "assets/icons/hashtag.svg";
import Image from "next/image";
import { useState } from "react";
import SerialModal from "../../../SerialModal";
import classes from "./SerialButton.module.scss";
import { useTranslations } from "next-intl";

export const SerialButton = () => {
  const t = useTranslations("SerialNumber");
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
        title={t("title")}
        onClick={open}
        className={classes.serialButton}
      >
        <figure>#</figure>
      </button>
      <SerialModal isOpen={isOpen} onClose={close} />
    </>
  );
};
