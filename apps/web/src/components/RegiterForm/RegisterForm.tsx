"use client";

import { useLogin } from "@/api/useLogin";
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
import County from "@biosfera/types";
import { SelectInput } from "components/SelectInput/SelectInput";

export const ReegisterForm = () => {
  const schema = z
    .object({
      firstName: z.string().min(2).max(100),
      lastName: z.string().min(2).max(100),
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
      email: z.string().email(),
      password: z.string().min(6).max(100),
      passwordConfirmation: z.string().min(6).max(100),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: "Passwords don't match",
      path: ["passwordConfirmation"],
    });

  const form = useForm({
    resolver: zodResolver(schema),
  });

  const login = useLogin();

  const onSubmit = async (data: any) => {
    await login.mutateAsync(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={classes.form}>
      <Input
        form={form}
        attribute="firstName"
        question="First Name"
        image={email}
      />
      <Input
        form={form}
        attribute="lastName"
        question="Last Name"
        image={email}
      />
      <SelectInput
        label="Location"
        name="location"
        options={Object.values(County)
          .filter((county) => county.length > 2)
          .map((county) => ({
            label: county
              .replace("_", "-")
              .toLowerCase()
              .charAt(0)
              .toUpperCase(),
            value: county,
          }))}
        form={form}
      />
      <Input form={form} attribute="email" question="Email" image={email} />
      <Input
        form={form}
        attribute="password"
        question="Password"
        isPassword
        image={password}
        isDisabled={login.isLoading}
      />
      <Input
        form={form}
        attribute="passwordConfirmation"
        question="Password Confirmation"
        isPassword
        image={password}
        isDisabled={login.isLoading}
      />
      <div className={classes.buttons}>
        <BaseButton text="Register" />
        <Link href="/regitration">
          <BaseButton text="Sign up" initColor={ButtonColor.BLUE} />
        </Link>
      </div>
    </form>
  );
};
