"use client";
import { SignInForm } from "components/SignInForm/SignInForm";
import GreenDrop from "../GreenDrop/GreenDrop";
import classes from "./ResetPasswordView.module.scss";
import wave from "assets/images/wave.svg";
import { QueryClientWrapper } from "@/utility/wrappers/queryWrapper";
import Image from "next/image";
import RegisterForm from "components/RegisterForm";
import ResetPaswordForm from "components/ResetPasswordForm";
import { useTranslations } from "next-intl";

export interface ResetPasswordViewProps {
  code: string;
}

const ResetPasswordView = ({ code }: ResetPasswordViewProps) => {
  const t = useTranslations("Pages");

  return (
    <div className={classes.container}>
      <div className={classes.drop}>
        <GreenDrop />
      </div>
      <span className={classes.title}>{t("resetPassword")}</span>
      <div className={classes.form}>
        <QueryClientWrapper>
          <ResetPaswordForm code={code} />
        </QueryClientWrapper>
      </div>
    </div>
  );
};

export default ResetPasswordView;
