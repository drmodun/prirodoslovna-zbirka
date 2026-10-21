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
import { useCountyName } from "@/utility/hooks/useCountyName";
import LanguageToggle from "components/LanguageToggle";
import useUser from "@/utility/context/UserContext";
import Modal from "components/BaseModal";
import Textarea from "components/Textarea";
import userImg from "assets/images/user-alt.svg";
import FileUpload from "components/FileUpload";
import { useEffect, useState } from "react";
import { useEditUserInfo } from "@/api/useEditUserInfo";
import { useUploadProfilePicture } from "@/api/useUploadProfilePicture";
import { useAdminUpdateUserInfo } from "@/api/useAdminUpdateUserInfo";
import { useTranslations } from "next-intl";

export const EditUserForm = ({
  user,
  isSuper,
}: {
  user: ExtendedUserResponse;
  isSuper?: boolean;
}) => {
  const t = useTranslations("EditUserForm");
  const countyName = useCountyName();
  const { user: loggedUser } = useUser();
  const schema = z.object({
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
    // A new picture sets the flag; otherwise it stays as it is, unless the
    // user removed the current picture.
    data.hasProfileImage = profilePicture.length > 0 || !!hasProfilePic;
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
          question={t("firstName")}
          image={userImg}
          error={form.formState.errors.firstName?.message?.toString()}
        />
        <Input
          form={form}
          attribute="lastName"
          question={t("lastName")}
          image={userImg}
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
            }))
            .sort((a, b) => a.label.localeCompare(b.label))}
          form={form}
          error={form.formState.errors.location?.message?.toString()}
        />
        {!isSuper &&
          (!hasProfilePic ? (
            <FileUpload
              name={t("changePicture")}
              onChange={setProfilePicture}
            />
          ) : (
            <BaseButton
              text={t("removePicture")}
              isNotSubmit
              onClick={() => setHasProfilePic(false)}
            ></BaseButton>
          ))}
        {loggedUser?.id === user.id && (
          <div className={classes.language}>
            <span>{t("language")}</span>
            <LanguageToggle />
          </div>
        )}
        <div className={classes.buttons}>
          <BaseButton text={t("save")} />
        </div>
      </form>
    </>
  );
};
