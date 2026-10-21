"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Input from "components/Input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import email from "assets/images/email.svg";
import password from "assets/images/password.svg";
import BaseButton from "components/BaseButton";
import classes from "./RegisterForm.module.scss";
import Link from "next/link";
import { ButtonColor } from "@/shared/enums";
import { County } from "@biosfera/types";
import { SelectInput } from "components/SelectInput/SelectInput";
import { useRegister } from "@/api/useRegister";
import { useCountyName } from "@/utility/hooks/useCountyName";
import { localeToLanguage, Locale } from "i18n/config";
import Modal from "components/BaseModal";
import Textarea from "components/Textarea";
import user from "assets/images/user-alt.svg";
import { useLocale, useTranslations } from "next-intl";

export const RegisterForm = () => {
  const t = useTranslations("Auth");
  const countyName = useCountyName();
  const locale = useLocale() as Locale;
  const schema = z
    .object({
      firstName: z
        .string()
        .min(2, t("firstNameMin"))
        .max(100, t("firstNameMax")),
      lastName: z
        .string()
        .min(2, t("lastNameMin"))
        .max(100, t("lastNameMax")),
      location: z.enum([
        "SPLITSKO_DALMATINSKA",
        "DUBROVACKO_NERETVANSKA",
        "SIBENSKO_KNINSKA",
        "ZADARSKA",
        "ZAGREBACKA",
        "KARLOVACKA",
        "VARAZDINSKA",
        "KOPRIVNICKO_KRIZEVACKA",
        "KRAPINSKO_ZAGORSKA",
        "MEDIMURSKA",
        "OSIJECKO_BARANJSKA",
        "POZESKO_SLAVONSKA",
        "PRIMORSKO_GORANSKA",
        "SISACKO_MOSLAVACKA",
        "VUKOVARSKO_SRIJEMSKA",
        "GRAD_ZAGREB",
        "BJELOVARSKO_BILOGORSKA",
        "BRODSKO_POSAVSKA",
        "ISTARSKA",
        "LICKO_SENJSKA",
        "VIROVITICKO_PODRAVSKA",
        "OTHER",
      ]),
      username: z.string(),
      bio: z.string().optional(),
      email: z.string().email(t("emailFormat")),
      password: z
        .string()
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}$/,
          t("passwordStrength"),
        ),
      passwordConfirmation: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: t("passwordsMismatch"),
      path: ["passwordConfirmation"],
    });

  const form = useForm({
    resolver: zodResolver(schema),
  });

  const { mutateAsync, isSuccess, isLoading } = useRegister();

  const onSubmit = async (data: any) => {
    // The language the account was created in becomes its preference.
    await mutateAsync({ ...data, language: localeToLanguage(locale) });
  };

  return (
    <>
      <Modal
        title={t("registeredTitle")}
        text={t("registeredText")}
        actionText={t("goToLogin")}
        actionLink="/login"
        open={isSuccess}
      />
      <form onSubmit={form.handleSubmit(onSubmit)} className={classes.form}>
        <Input
          form={form}
          attribute="firstName"
          question={t("firstName")}
          image={user}
          error={form.formState.errors.firstName?.message?.toString()}
        />
        <Input
          form={form}
          attribute="lastName"
          question={t("lastName")}
          image={user}
          error={form.formState.errors.lastName?.message?.toString()}
        />
        <Input
          form={form}
          attribute="username"
          question={t("username")}
          image={email}
          error={form.formState.errors.username?.message?.toString()}
        />
        <Textarea form={form} attribute="bio" question={t("bio")} />
        <SelectInput
          label={t("county")}
          name="location"
          options={Object.values(County)
            .filter((county) => county.length > 2)
            .map((county) => ({
              label: countyName(county),
              value: county,
            }))}
          form={form}
          error={form.formState.errors.location?.message?.toString()}
        />
        <Input
          form={form}
          attribute="email"
          question={t("email")}
          image={email}
          error={form.formState.errors.email?.message?.toString()}
        />
        <Input
          form={form}
          attribute="password"
          question={t("password")}
          isPassword
          image={password}
          isDisabled={isLoading}
          error={form.formState.errors.password?.message?.toString()}
        />
        <Input
          form={form}
          attribute="passwordConfirmation"
          question={t("confirmPassword")}
          isPassword
          image={password}
          isDisabled={isLoading}
          error={form.formState.errors.passwordConfirmation?.message?.toString()}
        />
        <div className={classes.buttons}>
          <BaseButton text={t("register")} />
          <Link href="/login">
            <BaseButton text={t("login")} initColor={ButtonColor.BLUE} />
          </Link>
        </div>
      </form>
    </>
  );
};
