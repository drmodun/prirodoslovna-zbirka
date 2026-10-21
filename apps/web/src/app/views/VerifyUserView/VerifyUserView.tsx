"use client";

import { useVerifyUser } from "@/api/useVerifyUser";
import classes from "./VerifyUserView.module.scss";
import GreenDrop from "../GreenDrop/GreenDrop";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

export interface VerifyUserViewProps {
  code: string;
}

export const VerifyUserView = ({ code }: VerifyUserViewProps) => {
  const t = useTranslations("Pages");
  const { mutate, isSuccess, isError } = useVerifyUser();

  useEffect(() => {
    mutate(code);
  }, [code, mutate]);

  return (
    <div className={classes.container}>
      <GreenDrop />
      <h1 className={classes.process}>
        {isSuccess
          ? t("verified")
          : isError
            ? t("verifyFailed")
            : t("verifying")}
      </h1>
    </div>
  );
};
