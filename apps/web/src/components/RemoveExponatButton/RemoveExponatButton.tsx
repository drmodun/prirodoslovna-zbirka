"use client";
import { useRemoveExponat } from "@/api/useRemoveExponat";
import classes from "./RemoveExponatButton.module.scss";
import remove from "assets/images/remove.svg";
import edit from "assets/images/edit.svg";
import Image from "next/image";
import { useEffect } from "react";
import { ExponatResponseShort } from "@biosfera/types";
import useUser from "@/utility/context/UserContext";
import Link from "next/link";

export interface RemoveExponatButtonProps {
  exponatId: string;
  onRemove?: (id: string) => void;
  isHidden?: boolean;
}

export const RemoveExponatButton: React.FC<RemoveExponatButtonProps> = ({
  exponatId,
  isHidden,
  onRemove,
}) => {
  const { mutate, isSuccess = false } = useRemoveExponat();
  const { favouriteExponats, updateFavourites } = useUser();

  const handleDelete = () => {
    const confirm = window.confirm(
      "Jeste li sigurni da želite maknuti eksponat?"
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
      onRemove && onRemove(exponatId);
    }
  }, [isSuccess]);

  return (
    <div className={classes.container}>
      <button
        onClick={handleDelete}
        title="Delete Exponat"
        className={classes.removalButton}
      >
        <Image title="Makni eksponat" src={remove} alt="Makni eksponat" />
      </button>
      {!isHidden && (
        <Link href={`/exponat/${exponatId}/edit`} className={classes.edit}>
          <Image src={edit} alt="edit" />
        </Link>
      )}
    </div>
  );
};
