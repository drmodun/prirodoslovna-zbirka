"use client";
import Image from "next/image";
import classes from "./SaveButton.module.scss";
import saveIcon from "assets/icons/save.svg";
import { useGetMe } from "@/api/useGetMe";
import useUser from "@/utility/context/UserContext";
import clsx from "clsx";

import { useEffect, useState } from "react";
import { WorkResponseExtended, WorkResponseShort } from "@biosfera/types";
import { useToggleSaveWork } from "@/api/useToggleSaveWork";

export interface SaveButtonProps {
  work: WorkResponseShort | WorkResponseExtended;
}

export const SaveButton = ({ work }: SaveButtonProps) => {
  const { savedWorks, updateSavedWorks, loading } = useUser();
  const { mutateAsync } = useToggleSaveWork();

  const [isSaved, setIsSaved] = useState(
    savedWorks.find((x) => x.id === work.id) != null
  );

  useEffect(() => {
    setIsSaved(savedWorks.find((x) => x.id === work.id) != null);
  }, [savedWorks, loading]);

  useEffect(() => {
    setIsSaved(savedWorks.find((x) => x.id === work.id) != null);
  }, []);

  const toggleSave = async () => {
    await mutateAsync(work.id);
    updateSavedWorks(work);
    setIsSaved((prev) => !prev);
  };

  return (
    <button
      className={clsx(classes.container, isSaved && classes.saved)}
      title="save"
      onClick={toggleSave}
    >
      <div className={classes.saveIcon}>
        <Image src={saveIcon} alt="botun za save" layout="fill" />
      </div>
    </button>
  );
};
