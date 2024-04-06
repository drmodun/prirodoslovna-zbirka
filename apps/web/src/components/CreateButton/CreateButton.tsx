"use client";
import useCreateButton from "@/utility/context/CreateButtonContext";
import classes from "./CreateButton.module.css";

export const CreateButton = () => {
  const { isVisibleButton, hideButton, showModal } = useCreateButton();

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
