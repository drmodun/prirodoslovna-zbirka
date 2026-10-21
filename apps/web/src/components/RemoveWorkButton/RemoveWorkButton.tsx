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
import { useTranslations } from "next-intl";

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
  const t = useTranslations("RemoveWorkButton");
  const { mutate, isSuccess = false } = useRemoveWork();

  const handleDelete = () => {
    const confirm = window.confirm(t("confirm"));
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
        title={t("label")}
        className={classes.removalButton}
      >
        <Image src={remove} alt={t("label")} />
      </button>
      {!isHidden && (
        <Link href={`/work/${workId}/edit`} className={classes.edit}>
          <Image src={edit} alt={t("edit")} />
        </Link>
      )}
    </div>
  );
};
