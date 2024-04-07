"use client";
import useCreateButton from "@/utility/context/CreateButtonContext";
import classes from "./CreateButton.module.scss";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import useUser from "@/utility/context/UserContext";

export const CreateButton = () => {
  const { isVisibleButton, hideButton, showModal, showButton } =
    useCreateButton();
  const { user } = useUser();
  const path = usePathname();

  useEffect(() => {
    if (!user) {
      hideButton && hideButton();
      return;
    }

    switch (path.split("/").toReversed()[0]) {
      case "createOrganisation":
        hideButton && hideButton();
        break;
      case "createExponat":
        hideButton && hideButton();
        break;
      case "createPost":
        hideButton && hideButton();
        break;
      case "login":
        hideButton && hideButton();
        break;
      case "register":
        hideButton && hideButton();
        break;
      case "activateUser":
        hideButton && hideButton();
        break;
      case "resetPassword":
        hideButton && hideButton();
        break;
      default:
        showButton && showButton();
        break;
    }
  }, [path, hideButton, showButton, user]);

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
