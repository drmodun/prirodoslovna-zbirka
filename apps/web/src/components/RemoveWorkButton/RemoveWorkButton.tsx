"use client";
import classes from "./RemoveWorkButton.module.scss";
import remove from "assets/images/remove.svg";
import edit from "assets/images/edit.svg";
import Image from "next/image";
import { useEffect } from "react";
import { WorkResponseShort } from "@biosfera/types";
import useUser from "@/utility/context/UserContext";
import Link from "next/link";
import { useRemoveWork } from "@/api/useRemoveWork";

export interface RemoveWorkButtonProps {
  workId: string;
  onRemove?: (id: string) => void;
  isHidden?: boolean;
}

export const RemoveWorkButton: React.FC<RemoveWorkButtonProps> = ({
  workId,
  isHidden,
  onRemove,
}) => {
  const { mutate, isSuccess = false } = useRemoveWork();

  const handleDelete = () => {
    const confirm = window.confirm(
      "Jeste li sigurni da želite maknuti projekt?",
    );
    confirm && mutate(workId);
  };

  useEffect(() => {
    if (isSuccess) {
      onRemove && onRemove(workId);
    }
  }, [isSuccess]);

  return (
    <div className={classes.container}>
      <button
        onClick={handleDelete}
        title="Delete Work"
        className={classes.removalButton}
      >
        <Image title="Makni projekt" src={remove} alt="Makni projekt" />
      </button>
      {!isHidden && (
        <Link href={`/work/${workId}/edit`} className={classes.edit}>
          <Image src={edit} alt="edit" />
        </Link>
      )}
    </div>
  );
};
