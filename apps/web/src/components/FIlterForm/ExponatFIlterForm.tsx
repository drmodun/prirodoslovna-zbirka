"use client";
import Link from "next/link";
import styles from "./FilterForm.module.scss";
import { z } from "zod";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "components/Input";
import SelectInput from "components/SelectInput";
import BaseButton from "components/BaseButton";
import { error } from "console";
import Dropdown from "components/Dropdown";
import { useGetTaxonomyEntities } from "@/api/useGetTaxonomyEntities";
import { SpeciesResponse, TaxonomyRankGbif } from "@biosfera/types";

interface Props {
  searchParams?: any;
}

export const ExponatFilter = ({ searchParams }: Props) => {
  const schema = z
    .object({
      name: z.optional(z.string()),
      alternateName: z.optional(z.string()),
      kingdom: z.optional(z.string()),
      phylum: z.optional(z.string()),
      class: z.optional(z.string()),
      order: z.optional(z.string()),
      genus: z.optional(z.string()),
      family: z.optional(z.string()),
      species: z.optional(z.string()),
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
      attribute: searchParams?.attribute || "Relevantnost",
      direction: searchParams?.direction || "desc",
      kingdom: searchParams?.kingdom || "",
      phylum: searchParams?.phylum || "",
      class: searchParams?.class || "",
      order: searchParams?.order || "",
      genus: searchParams?.genus || "",
      family: searchParams?.family || "",
      species: searchParams?.species || "",
    } as FieldValues,
  });

  const { data: kingdoms } = useGetTaxonomyEntities(
    form.watch("kingdom"),
    "KINGDOM"
  );

  const { data: phylums } = useGetTaxonomyEntities(
    form.watch("phylum"),
    "PHYLUM",
    kingdoms?.find(
      (kingdom: SpeciesResponse) =>
        kingdom.scientificName === form.watch("kingdom")
    )?.nubKey
  );

  const { data: classes } = useGetTaxonomyEntities(
    form.watch("class"),
    "CLASS"
  );

  const { data: orders } = useGetTaxonomyEntities(form.watch("order"), "ORDER");

  const { data: genuses } = useGetTaxonomyEntities(
    form.watch("genus"),
    "GENUS"
  );

  const { data: families } = useGetTaxonomyEntities(
    form?.watch("family"),
    "FAMILY",
    phylums?.find(
      (phylum: SpeciesResponse) => phylum.scientificName === form.watch("pylum") //GBIF sources do not seem to have all full slassiications, so it is safer to make a less efficient but more reliable call
      //TODO: check if this can be fixed
    )?.nubKey
  );

  const { data: species } = useGetTaxonomyEntities(
    form.watch("species"),
    "SPECIES",
    families?.find(
      (family: SpeciesResponse) =>
        family.scientificName === form.watch("family")
    )?.nubKey
  );

  //add better ways to filtrate

  const handleFilter = (data: any) => {};

  return (
    <div className={styles.container}>
      <form
        onSubmit={form.handleSubmit(handleFilter)}
        className={styles.filter}
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
            { label: "Relevantnost", value: "Relevantnost" },
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
        <Dropdown
          attribute="kingdom"
          form={form}
          options={
            kingdoms?.map((kingdom: SpeciesResponse) => ({
              label: kingdom.scientificName,
              value: kingdom.scientificName,
            })) || []
          }
          initSelected={form.watch("kingdom")}
          initPlaceholder="Izaberi Kraljevstvo"
          onSelect={(value) => {
            form.setValue("kingdom", value);
            form.setValue("phylum", "");
            form.setValue("class", "");
            form.setValue("order", "");
            form.setValue("genus", "");
            form.setValue("family", "");
            form.setValue("species", "");
          }}
        />
        <Dropdown
          attribute="phylum"
          form={form}
          initPlaceholder="Izaberi koljeno"
          options={
            phylums?.map((phylum: SpeciesResponse) => ({
              label: phylum.scientificName,
              value: phylum.scientificName,
            })) || []
          }
          onSelect={(value) => {
            form.setValue("phylum", value);
            form.setValue("class", "");
            form.setValue("order", "");
            form.setValue("genus", "");
            form.setValue("family", "");
            form.setValue("species", "");
          }}
        />
        <Dropdown
          attribute="class"
          form={form}
          options={
            classes?.map((class_: SpeciesResponse) => ({
              label: class_.scientificName,
              value: class_.scientificName,
            })) || []
          }
          initPlaceholder="Izaberi razred"
          onSelect={(value) => {
            form.setValue("class", value);
            form.setValue("order", "");
            form.setValue("genus", "");
            form.setValue("family", "");
            form.setValue("species", "");
          }}
        />
        <Dropdown
          attribute="order"
          form={form}
          initPlaceholder="Izaberi red"
          options={
            orders?.map((order: SpeciesResponse) => ({
              label: order.scientificName,
              value: order.scientificName,
            })) || []
          }
          onSelect={(value) => {
            form.setValue("order", value);
            form.setValue("genus", "");
            form.setValue("family", "");
            form.setValue("species", "");
          }}
        />
        <Dropdown
          attribute="genus"
          form={form}
          initPlaceholder="Izaberi rod"
          options={
            genuses?.map((genus: SpeciesResponse) => ({
              label: genus.scientificName,
              value: genus.scientificName,
            })) || []
          }
          onSelect={(value) => {
            form.setValue("genus", value);
            form.setValue("family", "");
            form.setValue("species", "");
          }}
        />
        <Dropdown
          attribute="family"
          form={form}
          initPlaceholder="Izaberi porodicu"
          options={
            families?.map((family: SpeciesResponse) => ({
              label: family.scientificName,
              value: family.scientificName,
            })) || []
          }
          onSelect={(value) => {
            form.setValue("family", value);
            form.setValue("species", "");
          }}
        />
        <Dropdown
          attribute="species"
          form={form}
          options={
            species?.map((specie: SpeciesResponse) => ({
              label: specie.scientificName,
              value: specie.scientificName,
            })) || []
          }
          initPlaceholder="Izaberi vrstu"
          onSelect={(value) => form.setValue("species", value)}
        />
      </form>
      <Link
        className={styles.button}
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
            ...(form.watch("attribute") &&
              form.watch("attribute") !== "Relevantnost" && {
                attribute: form.watch("attribute"),
              }),
            ...(form.watch("direction") &&
              form.watch("attribute") !== "Relevantnost" && {
                direction: form.watch("direction"),
              }),
            ...(form.watch("kingdom") && {
              kingdom: form.watch("kingdom"),
            }),
            ...(form.watch("phylum") && {
              phylum: form.watch("phylum"),
            }),
            ...(form.watch("class") && {
              class: form.watch("class"),
            }),
            ...(form.watch("order") && {
              order: form.watch("order"),
            }),
            ...(form.watch("genus") && {
              genus: form.watch("genus"),
            }),
            ...(form.watch("family") && {
              family: form.watch("family"),
            }),
            ...(form.watch("species") && {
              species: form.watch("species"),
            }),
          },
        }}
      >
        <BaseButton text="Pretraži" />
      </Link>
    </div>
  );
};

//7/70/45
//7/69/45
//7/69/46
//7/70/47
//6/35/22
//6/34/22
//6/34/23
//6/35/23
