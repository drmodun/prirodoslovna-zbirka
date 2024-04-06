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
import { makeCountyName } from "@/utility/static/countyNameMaker";
import FileUpload from "components/FileUpload";
import { useEffect, useState } from "react";
import { useUploadFile } from "@/api/useUploadFile";
import { useUpdateOrganisation } from "@/api/useUpdateOrganisation";
import useUser from "@/utility/context/UserContext";

export interface CreateOrganisationFormProps {
  initvalues?: ExtendedOrganisationResponse;
  isEdit?: boolean;
}

export const OrganisationForm = ({
  initvalues,
  isEdit,
}: CreateOrganisationFormProps) => {
  const schema = z.object({
    name: z
      .string()
      .min(2, "Ime more imati najmanje 2 slova")
      .max(100, "Ime more imati najvise 100 slova"),
    description: z
      .string()
      .min(2, "Deskripcija mora imati najmanje 2 slova")
      .max(200, "Deskripcija mora imati najviše 100 slova"),
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
    websiteUrl: z.string().url("Stranica mora biti pravilna"),
  });

  const [image, setImage] = useState<File[]>([]);

  const { mutateAsync } = useUploadFile();

  const { user } = useUser();

  useEffect(() => {
    if (!user) {
      alert("Morate biti prijavljeni da biste mogli kreirati organizaciju");
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
        question="Naziv organizacije"
        image={email}
        error={form.formState.errors.name?.message?.toString()}
      />

      <Input
        form={form}
        attribute="Opis"
        question="Opis"
        image={description}
        error={form.formState.errors.description?.message?.toString()}
      />

      <Input
        form={form}
        attribute="websiteUrl"
        question="Poveznica na web stranicu"
        image={url}
        error={form.formState.errors.websiteUrl?.message?.toString()}
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
        question="Adresa e-pošte"
        image={email}
        error={form.formState.errors.email?.message?.toString()}
      />

      <FileUpload
        name="Prenesite glavnu sliku za vašu organizaciju"
        onChange={setImage}
      />

      <div className={classes.buttons}>
        <BaseButton text={isEdit ? "Uredi" : "Stvori organizaciju"} />
      </div>
    </form>
  );
};
