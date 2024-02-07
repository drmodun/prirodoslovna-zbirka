"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Input from "components/Input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import email from "assets/images/email.svg";
import url from "assets/images/url.svg";
import organitionCover from "assets/images/organisationCover.svg";
import organitionIcon from "assets/images/organitionIcon.svg";
import description from "assets/images/description.svg";
import BaseButton from "components/BaseButton";
import classes from "./CreateOrganisationForm.module.scss";
import { County } from "@biosfera/types";
import { SelectInput } from "components/SelectInput/SelectInput";
import { useCreateOrganisation } from "@/api/useCreateOrganisation";
import { makeCountyName } from "@/utility/static/countyNameMaker";
 
export const CreateOrganisationForm = () => {
  const schema = z
    .object({
      organisationName: z.string().min(2).max(100),
      description: z.string().min(2).max(200),
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
      websiteUrl: z.string(),
      coverImage: z.string(),
      iconImages: z.string(),
    })

  const form = useForm({
    resolver: zodResolver(schema),
  });

  const create = useCreateOrganisation();

  const onSubmit = async (data: any) => {
    console.log(data);
    await create.mutateAsync(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={classes.form}>
      <Input
        form={form}
        attribute="organisationName"
        question="Organisation Name"
        image={email}
      />

      <Input
        form={form}
        attribute="description"
        question="Description"
        image={description}
      />
      
      <Input
        form={form}
        attribute="websiteUrl"
        question="Official Website url"
        image={url}
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
      />

      <Input
        form={form}
        attribute="email"
        question="Email"
        image={email} />

      <Input
        attribute="coverImage"
        question="Cover Image"
        image={organitionCover}
        form={form}
      />

      <Input
        form={form}
        attribute="iconImages"
        question="Icon Images"
        image={organitionIcon}
      />
      
      <div className={classes.buttons}>
        <BaseButton text="Kreiraj" />
      </div>
    </form>
  );
};
