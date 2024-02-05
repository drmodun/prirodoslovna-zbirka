"use client";
import {
  ExponatKind,
  ExponatResponseShort,
  SpeciesResponse,
} from "@biosfera/types";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "components/Input";
import { useForm } from "react-hook-form";
import { any, z } from "zod";
import classes from "./ExponatForm.module.scss";
import Textarea from "components/Textarea";
import ListInput from "components/ListInput";
import AttributeInput from "components/AttributeInput";
import SelectInput from "components/SelectInput";
import BaseButton from "components/BaseButton";
import Dropdown from "components/Dropdown";
import { useGetSpecies } from "@/api/useGetSpecies";
import { useState } from "react";
import { useCreateCategorization } from "@/api/useCreateCategorization";
import { useCheckForCategorization } from "@/api/useCheckForCategorization";
import { useReadOrCreateCategorization } from "@/api/useReadOrCreateCategorization";
import { useCreateExponat } from "@/api/useCreateExponat";
import { Domains } from "@/views/OrganisationBody/OrganisationBody";
export interface ExponatModalSectionsProps {
  organisationId: string;
}

export const ExponatForm = ({ organisationId }: ExponatModalSectionsProps) => {
  const schema = z
    .object({
      name: z
        .string()
        .min(2, " Ime mora imati više od 2 slova")
        .max(100, "Ime mora imati manje od 100 slova"),
      description: z
        .string()
        .min(2, "Opis mora imati više od 2 slova")
        .max(2000, "Opis mora imati manje od 2000 slova"),
      alternateName: z
        .string()
        .min(2, "Nomenklatura mora imati više od 2 slova"),
      funFacts: z
        .array(z.string().min(2, "Mora imati više od 2 slova"))
        .min(1, "Mora postojati barem jedan fun fact"),
      exponatKind: z.enum(["EUCARIOT", "PROCARIOT", "MINERAL"]),
      attributes: z.any(),
      mainImage: z.any(),
    })
    .refine(
      (data) => {
        return Object.keys(data.attributes).length > 0;
      },
      {
        message: "Mora postojati barem jedan atribut",
        path: ["attributes"],
      }
    );
  const [selectedSpecies, setSelectedSpecies] = useState<string>("" as string);

  const form = useForm({
    resolver: zodResolver(schema),
  });

  const { data, error, isLoading } = useGetSpecies(selectedSpecies);
  const { mutateAsync } = useReadOrCreateCategorization();
  const { mutateAsync: createExponat } = useCreateExponat();

  const onSubmit = async (formData: any) => {
    console.log(formData);

    const species = data?.find(
      (x: SpeciesResponse) => x.species === formData.alternateName
    );

    if (!species) {
      alert("Nomenklatura nije validna");
      return;
    }

    species.domain = formData.exponatKind;

    const exponatId = await mutateAsync(species);

    const request = {
      ...formData,
      ExponatKind: formData.exponatKind,
      mainImage: "https://via.placeholder.com/150",
      attributes: JSON.stringify(formData.attributes),
      categorizationId: exponatId,
    };

    const params = {
      organisationId,
      exponat: request,
    };

    const action = await createExponat(params);
    if (!action) {
      alert("Greška prilikom kreiranja eksponata");
      return;
    } else {
      alert("Eksponat uspješno kreiran");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={classes.form}>
      <Input form={form} attribute="name" question="Ime" />
      <p className={classes.error}>
        {form.formState.errors.name?.message?.toString() || ""}
      </p>
      <Dropdown
        form={form}
        attribute="alternateName"
        initPlaceholder="Znanstvena vrsta eksponata"
        options={
          data
            ?.filter(
              (x: SpeciesResponse) =>
                x.rank === "SPECIES" && x.species.split(" ").length > 1
            ) //Check for valid species with two word nomenclature
            .map((species: SpeciesResponse) => ({
              value: species.species,
              label: species.species,
            })) || []
        }
        onSelect={setSelectedSpecies}
      />{" "}
      <p className={classes.error}>
        {form.formState.errors.alternateName?.message?.toString() || ""}
      </p>
      <Textarea form={form} attribute="description" question="Description" />
      <p className={classes.error}>
        {form.formState.errors.description?.message?.toString() || ""}
      </p>
      <ListInput form={form} attribute="funFacts" question="Fun Facts" />
      <p className={classes.error}>
        {form.formState.errors.funFacts?.message?.toString() || ""}
      </p>
      <AttributeInput
        form={form}
        attribute="attributes"
        question="Attributes"
      />{" "}
      <p className={classes.error}>
        {form.formState.errors.attributes?.message?.toString() || ""}
      </p>
      <SelectInput
        form={form}
        name="exponatKind"
        label="Vrsta exponata"
        options={[
          { value: "EUCARIOT", label: "Eukariot" },
          { value: "PROCARIOT", label: "Procariot" },
          { value: "MINERAL", label: "Mineral" },
        ]}
      />
      <BaseButton text="Pošalji" />
    </form>
  );
};