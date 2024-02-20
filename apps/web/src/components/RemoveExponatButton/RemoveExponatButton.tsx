"use client";
import { useRemoveExponat } from "@/api/useRemoveExponat";
import classes from "./RemoveExponatButton.module.scss";
import remove from "assets/images/remove.svg";
import Image from "next/image";
import { useEffect } from "react";
import { ExponatResponseShort } from "@biosfera/types";
import useUser from "@/utility/context/UserContext";

export interface RemoveExponatButtonProps {
  exponatId: string;
}

export const RemoveExponatButton: React.FC<RemoveExponatButtonProps> = ({
  exponatId,
}) => {
  const { mutate, isSuccess } = useRemoveExponat();
  const { favouriteExponats, updateFavourites } = useUser();

  const handleDelete = () => {
    const confirm = window.confirm(
      "Da li ste sigurni da želite da uklonite eksponat?"
    );
    confirm && mutate(exponatId);

    if (
      favouriteExponats.some((x: ExponatResponseShort) => x.id === exponatId)
    ) {
      const favouriteToRemove = favouriteExponats.find(
        (x: ExponatResponseShort) => x.id === exponatId
      );
      updateFavourites(favouriteToRemove!);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      window.location.reload(); //TODO: possibly change the solution later
    }
  }, [isSuccess]);

  return (
    <div className={classes.container}>
      <button
        onClick={handleDelete}
        title="Delete Exponat"
        className={classes.removalButton}
      >
        <Image
          title="Makni eksponat"
          src={remove}
          alt="Makni eksponat"
          layout="fill"
        />
      </button>
    </div>
  );
};
