import { afterPasswordReset, useResetPassword } from "@/api/useResetPassword";
import RevokeApiTokensPrompt from "components/RevokeApiTokensPrompt";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import BaseButton from "components/BaseButton";
import Input from "components/Input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import password from "assets/images/password.svg";
import classes from "./ResetPasswordForm.module.scss";
import { useTranslations } from "next-intl";
export interface ResetPaswordFormProps {
  code: string;
}

export const ResetPaswordForm: React.FC<ResetPaswordFormProps> = ({ code }) => {
  const t = useTranslations("Auth");
  const schema = z
    .object({
      password: z
        .string()
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}$/,
          t("passwordStrength"),
        ),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsMismatch"),
      path: ["confirmPassword"],
    });
  const form = useForm({
    resolver: zodResolver(schema),
  });

  const { mutateAsync } = useResetPassword();
  // Active API tokens the reset kept, to ask about.
  const [keptTokens, setKeptTokens] = useState(0);

  const onSubmit = async (data: any) => {
    const result = await mutateAsync({
      userActivationCode: code,
      newPassword: data.password,
    });
    if (result?.activeApiTokens) setKeptTokens(result.activeApiTokens);
  };

  return (
    <form className={classes.form} onSubmit={form.handleSubmit(onSubmit)}>
      {keptTokens > 0 && (
        <RevokeApiTokensPrompt
          count={keptTokens}
          onDone={() => afterPasswordReset(true)}
        />
      )}
      <Input
        form={form}
        attribute="password"
        question={t("newPassword")}
        error={form.formState.errors.password?.message?.toString()}
        image={password}
        isPassword
      />

      <Input
        form={form}
        attribute="confirmPassword"
        question={t("confirmPassword")}
        error={form.formState.errors.confirmPassword?.message?.toString()}
        image={password}
        isPassword
      />
      <BaseButton text={t("resetPassword")} />
    </form>
  );
};
