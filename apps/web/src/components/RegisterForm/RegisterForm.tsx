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
import { County } from "@biosfera/types";
import { SelectInput } from "components/SelectInput/SelectInput";
import { useRegister } from "@/api/useRegister";
import { makeCountyName } from "@/utility/static/countyNameMaker";

export const RegisterForm = () => {
  const schema = z
    .object({
      firstName: z
        .string()
        .min(2, "Ime mora imati najmanje 2 slova")
        .max(100, "Ime mora imati najviše 100 slova"),
      lastName: z
        .string()
        .min(2, "Prezime mora imati najmanje 2 slova")
        .max(100, "Prezime mora imati najviše 100 slova"),
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
      email: z.string().email("Mail mora biti pravilan"),
      password: z
        .string()
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}$/,
          "Lozinka mora imati najmanje 8 znakova, jedno veliko slovo, jedno malo slovo, jedan broj i jedan specijalni znak"
        ),
      passwordConfirmation: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: "Lozinke se ne podudaraju",
      path: ["passwordConfirmation"],
    });

  const form = useForm({
    resolver: zodResolver(schema),
  });

  const register = useRegister();

  const onSubmit = async (data: any) => {
    console.log(data);
    await register.mutateAsync(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={classes.form}>
      <Input
        form={form}
        attribute="firstName"
        question="First Name"
        image={email}
        error={form.formState.errors.firstName?.message?.toString()}
      />
      <Input
        form={form}
        attribute="lastName"
        question="Last Name"
        image={email}
        error={form.formState.errors.lastName?.message?.toString()}
      />
      <SelectInput
        label="Location"
        name="location"
        options={Object.values(County)
          .filter((county) => county.length > 2)
          .map((county) => ({
            label: makeCountyName(county),
            value: county,
          }))}
        form={form}
        error={form.formState.errors.location?.message?.toString()}
      />
      <Input
        form={form}
        attribute="email"
        question="Email"
        image={email}
        error={form.formState.errors.email?.message?.toString()}
      />
      <Input
        form={form}
        attribute="password"
        question="Password"
        isPassword
        image={password}
        isDisabled={register.isLoading}
        error={form.formState.errors.password?.message?.toString()}
      />
      <Input
        form={form}
        attribute="passwordConfirmation"
        question="Password Confirmation"
        isPassword
        image={password}
        isDisabled={register.isLoading}
        error={form.formState.errors.passwordConfirmation?.message?.toString()}
      />
      <div className={classes.buttons}>
        <BaseButton text="Register" />
        <Link href="/login">
          <BaseButton text="Sign in" initColor={ButtonColor.BLUE} />
        </Link>
      </div>
    </form>
  );
};

//TODO: Make frontend validation and error messages blocked by the "MODAL" task
