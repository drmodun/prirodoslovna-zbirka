"use client";
import Image from "next/image";
import classes from "./SaveButton.module.scss";
import saveIcon from "assets/icons/save.svg";
import { useGetMe } from "@/api/useGetMe";
import useUser from "@/utility/context/UserContext";
import clsx from "clsx";

import { useEffect, useState } from "react";
import { WorkResponseShort } from "@biosfera/types";
import { useToggleSaveWork } from "@/api/useToggleSaveWork";
import { useToggleSaveLiterature } from "@/api/useToggleSaveLiterature";

export interface SaveButtonProps {
  work: WorkResponseShort;
}

export const SaveButton = ({ work }: SaveButtonProps) => {
  const {
    savedWorks,
    updateSavedWorks,
    loading,
    savedLiterature,
    updateSavedLiterature,
  } = useUser();
  const { mutateAsync: toggleSaveWork } = useToggleSaveWork();
  const { mutateAsync: toggleSaveLiterature } = useToggleSaveLiterature();

  const [isSaved, setIsSaved] = useState(
    savedWorks.find((x) => x.id === work.id) != null
  );

  useEffect(() => {
    setIsSaved(
      work.isGbif
        ? savedLiterature.find((x) => x.literatureId === work.id) != null
        : savedWorks.find((x) => x.id === work.id) != null
    );
  }, [savedWorks, savedLiterature, loading]);

  useEffect(() => {
    setIsSaved(
      work.isGbif
        ? savedLiterature.find((x) => x.literatureId === work.id) != null
        : savedWorks.find((x) => x.id === work.id) != null
    );
  }, []);

  const toggleSave = async () => {
    work.isGbif
      ? await toggleSaveLiterature(work.id)
      : await toggleSaveWork(work.id);
    work.isGbif
      ? updateSavedLiterature({
          literatureId: work.id,
          createdAt: new Date(),
        })
      : updateSavedWorks(work);
    setIsSaved((prev) => !prev);
  };

  return (
    !loading && (
      <button
        className={clsx(classes.container, isSaved && classes.saved)}
        title="save"
        onClick={toggleSave}
      >
        <div className={classes.saveIcon}>
          <Image src={saveIcon} alt="botun za save" layout="fill" />
        </div>
      </button>
    )
  );
};
