"use client";
import React, { PropsWithChildren, use, useEffect, useState } from "react";
import classes from "./BaseModal.module.scss";
import { createPortal } from "react-dom";
import Link from "next/link";

interface ModalProps {
  title: string;
  text: string;
  open: boolean;
  deMount?: Function;
  children?: React.ReactNode;
  actionText?: string;
  actionLink?: string;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  text,
  deMount,
  children,
  open,
  actionLink,
  actionText,
}) => {
  const [mounted, setMounted] = useState<boolean>(open);

  useEffect(() => {
    if (mounted) {
      document.documentElement.style.overflow = "hidden";
      setMounted(true);
    } else {
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      setMounted(false);
    };
  }, [mounted]);

  useEffect(() => {
    setMounted(open);
  }, [open]);

  const unMount = () => {
    setMounted(false);
    deMount && deMount();
  };

  return mounted && open
    ? createPortal(
        <div id="#portal" className={classes.popup} onClick={unMount}>
          <div
            className={classes.popupInner}
            onClick={(e) => e.stopPropagation()}
          >
            <h1>{title}</h1>
            <p>{text}</p>
            <div className={classes.children}>{children}</div>
            {actionLink ? (
              <Link className={classes.link} href={actionLink}>
                {actionText || "U redu"}
              </Link>
            ) : (
              <button
                type="button"
                className={classes.modalButton}
                onClick={unMount}
              >
                {actionText || "U redu"}
              </button>
            )}
          </div>
        </div>,
        document.querySelector("#portal")!
      )
    : null;
};
