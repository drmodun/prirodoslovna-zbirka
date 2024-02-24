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

interface Props {
  searchParams?: any;
}

export const ExponatFilter = ({ searchParams }: Props) => {
  const schema = z
    .object({
      name: z.optional(z.string()),
      alternateName: z.optional(z.string()),
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
      alternateName: searchParams?.search || "",
      attribute: searchParams?.attribute || "",
      direction: searchParams?.direction || "",
    } as FieldValues,
  });

  //add better ways to filtrate

  const handleFilter = (data: any) => {
    console.log(data);
  };

  return (
    <div className={classes.container}>
      <form
        onSubmit={form.handleSubmit(handleFilter)}
        className={classes.filter}
      >
        <h2>Filter eksponata</h2>
        <Input form={form} attribute="name" question="Naziv" />
        <Input
          form={form}
          attribute="alternateName"
          question="Alternativni naziv"
          error={form.formState.errors.alternateName?.message?.toString()}
        />
        <SelectInput
          name="attribute"
          label="Sortiraj po"
          form={form}
          options={[
            { label: "Naslov", value: "name" },
            { label: "Datumu kreiranja", value: "createdAt" },
            { label: "Broju postova", value: "postAmount" },
            { label: "Broju favorita", value: "favourites" },
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
            kind: "exponat",
            ...(form.watch("name") && {
              name: form.watch("name"),
            }),
            ...(form.watch("alternateName") && {
              search: form.watch("alternateName"),
            }),
            ...(form.watch("attribute") && {
              attribute: form.watch("attribute"),
            }),
            ...(form.watch("direction") && {
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
