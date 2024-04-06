"use client";
import useCreateButton from "@/utility/context/CreateButtonContext";
import classes from "./CreateButton.module.css";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export const CreateButton = () => {
  const { isVisibleButton, hideButton, showModal, showButton } =
    useCreateButton();
  const path = usePathname();

  useEffect(() => {
    switch (path) {
      case "/":
        showButton && showButton();
        break;
      case "/discover":
        showButton && showButton();
        break;
      case "/discover/exponat":
        showButton && showButton();
        break;
      case "/discover/organisation":
        showButton && showButton();
        break;
      case "/discover/post":
        showButton && showButton();
        break;
      case "/profile":
        showButton && showButton();
        break;
      case "/profile/[id]":
        showButton && showButton();
        break;
      case "/organisation":
        showButton && showButton();
        break;
      case "/organisation/[id]":
        showButton && showButton();
        break;
      case "/exponat":
        showButton && showButton();
        break;
      case "/exponat/[id]":
        showButton && showButton();
        break;
      case "/post":
        showButton && showButton();
        break;
      case "/post/[id]":
        showButton && showButton();
        break;
      default:
        hideButton && hideButton();
        break;
    }
  }, [path, hideButton, showButton]);

  const handleClickCreateButton = () => {
    hideButton && hideButton();
    showModal && showModal();
  };

  return (
    isVisibleButton && (
      <button
        onClick={handleClickCreateButton}
        className={classes.createButton}
      >
        +
      </button>
    )
  );
};
