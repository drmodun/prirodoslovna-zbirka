"use client";
import React, { PropsWithChildren, useEffect, useState } from "react";
import classes from "./Modal.module.scss";
import { createPortal } from "react-dom";

interface ModalProps {
  title: string;
  text: string;
  open: boolean;
  deMount: Function;
}

export const Modal: React.FC<ModalProps> = ({ title, text, deMount, open }) => {
  const [mounted, setMounted] = useState<boolean>(open);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    setMounted(true);

    return () => {
      document.documentElement.style.overflow = "";
      setMounted(false);
    };
  }, [open]);

  const unMount = () => {
    setMounted(false);
    deMount();
  };

  return mounted
    ? createPortal(
        <div id="#portal" className={classes.popup} onClick={unMount}>
          <div className={classes.popupInner}>
            <h1>{title}</h1>
            <p>{text}</p>
            <button onClick={unMount}>OK</button>
          </div>
        </div>,
        document.querySelector("#portal")!
      )
    : null;
};
