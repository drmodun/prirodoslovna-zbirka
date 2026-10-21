"use client";

import { useLogin } from "@/api/useLogin";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "components/Input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import email from "assets/images/email.svg";
import password from "assets/images/password.svg";
import BaseButton from "components/BaseButton";
import classes from "./SignInForm.module.scss";
import Link from "next/link";
import { ButtonColor } from "@/shared/enums";
import { QueryClient, QueryClientProvider, useQueryClient } from "react-query";
import Modal from "components/BaseModal";
import { useState } from "react";
import SingleInput from "components/SingleInput";
import { useSendPasswordResetEmail } from "@/api/useSendPasswordResetEmail";
import { useTranslations } from "next-intl";

export const SignInForm = () => {
  const t = useTranslations("Auth");
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
  });

  const form = useForm({
    resolver: zodResolver(schema),
  });

  const login = useLogin();
  const queryClient = useQueryClient();

  const [resetEmail, setResetEmail] = useState("");

  const onSubmit = async (data: any) => {
    await login.mutateAsync(data);
    await queryClient.invalidateQueries("me");
  };

  const [open, setOpen] = useState(false);
  const { mutateAsync } = useSendPasswordResetEmail();

  const sendResetEmail = async () => {
    await mutateAsync(resetEmail.replace("@", "%40"));
    setOpen(false);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={classes.form}>
      <Input
        form={form}
        attribute="email"
        question={t("email")}
        image={email}
      />
      <Input
        form={form}
        attribute="password"
        question={t("password")}
        isPassword
        image={password}
        isDisabled={login.isLoading}
      />
      <span className={classes.forgotPassword}>
        <span onClick={() => setOpen(true)}>{t("forgotPassword")}</span>
      </span>
      <Modal
        open={open}
        title={t("recoveryTitle")}
        text={t("recoveryText")}
        actionText={t("close")}
        deMount={() => setOpen(false)}
      >
        <div className={classes.modalInput}>
          <SingleInput
            onChange={setResetEmail}
            question={t("recoveryEmail")}
            value={resetEmail}
            image={email}
          />
          <BaseButton
            isNotSubmit
            onClick={sendResetEmail}
            text={t("sendRecovery")}
          />
        </div>
      </Modal>
      <div className={classes.buttons}>
        <BaseButton text={t("login")} />
        <Link href="/register">
          <BaseButton text={t("register")} initColor={ButtonColor.BLUE} />
        </Link>
      </div>
    </form>
  );
};
