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
import { makeCountyName } from "@/utility/static/countyNameMaker";
import Modal from "components/BaseModal";
import Textarea from "components/Textarea";
import user from "assets/images/user-alt.svg";

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
      username: z.string(),
      bio: z.string().optional(),
      email: z.string().email("Mail mora biti pravilan"),
      password: z
        .string()
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
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

  const { mutateAsync, isSuccess, isLoading } = useRegister();

  const onSubmit = async (data: any) => {
    await mutateAsync(data);
  };

  return (
    <>
      <Modal
        title="Success"
        text="Uspješno napravljen korisnik, molimo potvrdie email pa se prijavite"
        actionText="Otiđi na prijavu"
        actionLink="/login"
        open={isSuccess}
      />
      <form onSubmit={form.handleSubmit(onSubmit)} className={classes.form}>
        <Input
          form={form}
          attribute="firstName"
          question="Ime"
          image={user}
          error={form.formState.errors.firstName?.message?.toString()}
        />
        <Input
          form={form}
          attribute="lastName"
          question="Prezime"
          image={user}
          error={form.formState.errors.lastName?.message?.toString()}
        />
        <Input
          form={form}
          attribute="username"
          question="Korisničko ime"
          image={email}
          error={form.formState.errors.username?.message?.toString()}
        />
        <Textarea form={form} attribute="bio" question="Opis" />
        <SelectInput
          label="Županija"
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
          question="Adresa e-pošte"
          image={email}
          error={form.formState.errors.email?.message?.toString()}
        />
        <Input
          form={form}
          attribute="password"
          question="Lozinka"
          isPassword
          image={password}
          isDisabled={isLoading}
          error={form.formState.errors.password?.message?.toString()}
        />
        <Input
          form={form}
          attribute="passwordConfirmation"
          question="Potvrdi lozinku"
          isPassword
          image={password}
          isDisabled={isLoading}
          error={form.formState.errors.passwordConfirmation?.message?.toString()}
        />
        <div className={classes.buttons}>
          <BaseButton text="Registrirajte se" />
          <Link href="/login">
            <BaseButton text="Prijavite se" initColor={ButtonColor.BLUE} />
          </Link>
        </div>
      </form>
    </>
  );
};
