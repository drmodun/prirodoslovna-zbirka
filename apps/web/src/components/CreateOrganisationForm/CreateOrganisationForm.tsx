"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Input from "components/Input";
import { FieldValues, set, useForm } from "react-hook-form";
import { z } from "zod";
import email from "assets/images/email.svg";
import url from "assets/images/url.svg";
import organitionCover from "assets/images/organisationCover.svg";
import organitionIcon from "assets/images/organitionIcon.svg";
import description from "assets/images/description.svg";
import BaseButton from "components/BaseButton";
import classes from "./CreateOrganisationForm.module.scss";
import {
  County,
  Directories,
  ExtendedOrganisationResponse,
} from "@biosfera/types";
import { SelectInput } from "components/SelectInput/SelectInput";
import { useCreateOrganisation } from "@/api/useCreateOrganisation";
import { useCountyName } from "@/utility/hooks/useCountyName";
import FileUpload from "components/FileUpload";
import { useEffect, useState } from "react";
import { useUploadFile } from "@/api/useUploadFile";
import { useUpdateOrganisation } from "@/api/useUpdateOrganisation";
import useUser from "@/utility/context/UserContext";
import { useTranslations } from "next-intl";

export interface CreateOrganisationFormProps {
  initvalues?: ExtendedOrganisationResponse;
  isEdit?: boolean;
}

export const OrganisationForm = ({
  initvalues,
  isEdit,
}: CreateOrganisationFormProps) => {
  const t = useTranslations("OrganisationForm");
  const tValidation = useTranslations("Validation");
  const countyName = useCountyName();
  const schema = z.object({
    name: z
      .string()
      .min(2, t("nameMin"))
      .max(100, t("nameMax")),
    description: z
      .string()
      .min(2, t("descriptionMin"))
      .max(200, t("descriptionMax")),
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
    email: z.string().email(tValidation("emailFormat")),
    websiteUrl: z.string().url(tValidation("urlFormat")),
  });

  const [image, setImage] = useState<File[]>([]);

  const { mutateAsync } = useUploadFile();

  const { user } = useUser();

  useEffect(() => {
    if (!user) {
      alert(t("loginRequired"));
    }
  }, []);

  const form = useForm({
    resolver: zodResolver(schema),
    ...(initvalues && { defaultValues: initvalues as FieldValues }),
  });

  const create = useCreateOrganisation();
  const update = useUpdateOrganisation();

  const onSubmit = async (data: any) => {
    data.mainImage = isEdit && initvalues?.mainImage;
    isEdit
      ? image[0] &&
        (data.mainImage = await mutateAsync({
          file: image[0],
          directory: Directories.ORGANISATION,
        }))
      : (data.mainImage = await mutateAsync({
          file: image[0],
          directory: Directories.ORGANISATION,
        }));
    const response = isEdit
      ? await update.mutateAsync({
          organisationId: initvalues!.id,
          updateOrganisationDto: data,
        })
      : await create.mutateAsync(data);

    if (response) {
      setTimeout(() => {
        window.location.href = `/organisation/${response.id}`;
      }, 1000);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={classes.form}>
      <Input
        form={form}
        attribute="name"
        question={t("name")}
        image={email}
        error={form.formState.errors.name?.message?.toString()}
      />

      <Input
        form={form}
        attribute="description"
        question={t("description")}
        image={description}
        error={form.formState.errors.description?.message?.toString()}
      />

      <Input
        form={form}
        attribute="websiteUrl"
        question={t("websiteUrl")}
        image={url}
        error={form.formState.errors.websiteUrl?.message?.toString()}
      />

      <SelectInput
        label={t("location")}
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

      <FileUpload
        name={t("mainImage")}
        onChange={setImage}
      />

      <div className={classes.buttons}>
        <BaseButton text={isEdit ? t("edit") : t("create")} />
      </div>
    </form>
  );
};
