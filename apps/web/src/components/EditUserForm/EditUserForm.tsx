"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Input from "components/Input";
import { Field, FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import email from "assets/images/email.svg";
import password from "assets/images/password.svg";
import BaseButton from "components/BaseButton";
import classes from "./EditUserForm.module.scss";
import Link from "next/link";
import { ButtonColor } from "@/shared/enums";
import {
  County,
  ExtendedUserResponse,
  ShortUserResponse,
} from "@biosfera/types";
import { SelectInput } from "components/SelectInput/SelectInput";
import { useRegister } from "@/api/useRegister";
import { makeCountyName } from "@/utility/static/countyNameMaker";
import Modal from "components/BaseModal";
import Textarea from "components/Textarea";
import userImg from "assets/images/user-alt.svg";
import FileUpload from "components/FileUpload";
import { useEffect, useState } from "react";
import { useEditUserInfo } from "@/api/useEditUserInfo";
import { useUploadProfilePicture } from "@/api/useUploadProfilePicture";
import { useAdminUpdateUserInfo } from "@/api/useAdminUpdateUserInfo";

export const EditUserForm = ({
  user,
  isSuper,
}: {
  user: ExtendedUserResponse;
  isSuper?: boolean;
}) => {
  const schema = z.object({
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
    hasProfileImage: z.boolean().optional(),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      username: user.username,
      bio: user.bio,
      hasProfileImage: user.hasProfileImage || false,
    } as FieldValues,
  });

  const { mutateAsync, isLoading } = useEditUserInfo();
  const { mutateAsync: uploadImage, isSuccess } = useUploadProfilePicture();
  const { mutateAsync: adminEditUserInfo } = useAdminUpdateUserInfo();

  const [profilePicture, setProfilePicture] = useState<File[]>([]);
  const [hasProfilePic, setHasProfilePic] = useState(user.hasProfileImage);

  useEffect(() => {
    if (profilePicture.length > 0) {
      setHasProfilePic(true);
    }
  }, [profilePicture]);

  useEffect(() => {
    setHasProfilePic(user.hasProfileImage);
  }, [user.hasProfileImage]);

  const onSubmit = async (data: any) => {
    profilePicture[0] && (await uploadImage(profilePicture[0]));
    data.hasProfileImage = hasProfilePic && profilePicture.length > 0;
    isSuper
      ? await adminEditUserInfo({
          userId: user.id,
          userInfo: data,
        })
      : await mutateAsync(data);
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className={classes.form}>
        <Input
          form={form}
          attribute="firstName"
          question="Ime"
          image={userImg}
          error={form.formState.errors.firstName?.message?.toString()}
        />
        <Input
          form={form}
          attribute="lastName"
          question="Prezime"
          image={userImg}
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
            }))
            .sort((a, b) => a.label.localeCompare(b.label))}
          form={form}
          error={form.formState.errors.location?.message?.toString()}
        />
        {!isSuper &&
          (!hasProfilePic ? (
            <FileUpload
              name="Promjenite profilnu sliku"
              onChange={setProfilePicture}
            />
          ) : (
            <BaseButton
              text="Uklonite profilnu sliku"
              onClick={() => setHasProfilePic(false)}
            ></BaseButton>
          ))}
        <div className={classes.buttons}>
          <BaseButton text="Spremi promjene" />
        </div>
      </form>
    </>
  );
};
