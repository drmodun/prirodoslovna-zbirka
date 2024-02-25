"use client";
import Link from "next/link";
import classes from "./FilterForm.module.scss";
import { z } from "zod";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "components/Input";
import SelectInput from "components/SelectInput";
import BaseButton from "components/BaseButton";
import { error } from "console";
import { County } from "@biosfera/types";
import { makeCountyName } from "@/utility/static/countyNameMaker";

interface Props {
  searchParams?: any;
}

export const OrganisationFilter = ({ searchParams }: Props) => {
  const schema = z
    .object({
      name: z.optional(z.string()),
      location: z.optional(
        z.enum([
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
        ])
      ),
      attribute: z.optional(
        z.enum(["name", "createdAt", "postAmount", "favourites"])
      ),
      direction: z.optional(z.enum(["asc", "desc"])),
    })
    .refine((data) => {
      if (data.direction && !data.attribute) {
        return false;
      }
      if (data.attribute && !data.direction) {
        return false;
      }
    }, "Smjer i atribut samo mogu biti oboje odabrani ili oboje prazni");

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: searchParams?.name || searchParams?.title || "",
      location: searchParams?.location,
      attribute: searchParams?.attribute || "Relevantnost",
      direction: searchParams?.direction || "desc",
    } as FieldValues,
  });

  const handleFilter = (data: any) => {
  };

  return (
    <div className={classes.container}>
      <form
        onSubmit={form.handleSubmit(handleFilter)}
        className={classes.filter}
      >
        <h2>Filter organizacija</h2>
        <Input form={form} attribute="name" question="Naziv" />
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
        <SelectInput
          name="attribute"
          label="Sortiraj po"
          form={form}
          options={[
            { label: "Relevantnost", value: "Relevantnost" },
            { label: "Naslov", value: "name" },
            { label: "Lokacija", value: "location" },
            { label: "Bodovi", value: "points" },
          ]}
          error={form.formState.errors.attribute?.message?.toString()}
        />
        <SelectInput
          name="direction"
          label="Smjer"
          form={form}
          options={[
            { label: "Uzlazno", value: "asc" },
            { label: "Silazno", value: "desc" },
          ]}
          error={form.formState.errors.direction?.message?.toString()}
        />
      </form>
      <Link
        className={classes.button}
        href={{
          pathname: "/search",
          query: {
            kind: "organisation",
            ...(form.watch("name") && {
              name: form.watch("name"),
            }),
            ...(form.watch("location") && {
              location: form.watch("location"),
            }),
            ...(form.watch("attribute") &&
              form.watch("attribute") !== "Relevantnost" && {
                attribute: form.watch("attribute"),
              }),
            ...(form.watch("direction") &&
              form.watch("attribute") !== "Relevantnost" && {
                direction: form.watch("direction"),
              }),
          },
        }}
      >
        <BaseButton text="Pretraži" />
      </Link>
    </div>
  );
};
