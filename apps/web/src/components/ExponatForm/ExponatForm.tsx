"use client";
import {
  Directories,
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
import { useReadOrCreateCategorization } from "@/api/useReadOrCreateCategorization";
import { CreateExponatDto, useCreateExponat } from "@/api/useCreateExponat";
import FileUpload from "components/FileUpload";
import { useUploadFile } from "@/api/useUploadFile";
import toast from "react-hot-toast";
export interface ExponatModalSectionsProps {
  organisationId: string;
}

export const ExponatForm = ({ organisationId }: ExponatModalSectionsProps) => {
  const schema = z
    .object({
      name: z
        .string()
        .min(5, " Ime mora imati više od 5 slova")
        .max(100, "Ime mora imati manje od 100 slova"),
      description: z
        .string()
        .min(10, "Opis mora imati više od 10 slova")
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
  const [exponatMainImage, setExponatMainImage] = useState<File[]>(
    [] as File[]
  );

  const form = useForm({
    resolver: zodResolver(schema),
  });

  const { data, error, isLoading } = useGetSpecies(selectedSpecies);
  const { mutateAsync } = useReadOrCreateCategorization();
  const { mutateAsync: createExponat } = useCreateExponat();
  const { mutateAsync: uploadImage } = useUploadFile();

  const onSubmit = async (formData: any) => {
    console.log(formData);

    if (exponatMainImage.length === 0) {
      toast.error("Mora postojati glavna slika eksponata");
      return;
    }

    const species = data?.find(
      (x: SpeciesResponse) => x.species === formData.alternateName
    );

    if (!species) {
      alert("Nomenklatura nije validna");
      return;
    }

    species.domain = formData.exponatKind;

    const speciesId = await mutateAsync(species);

    if (!speciesId) {
      toast.error("Greška prilikom kreiranja kategorizacije");
      return;
    }

    const image = await uploadImage({
      file: exponatMainImage[0],
      directory: Directories.EXPONAT,
    });

    if (!image) {
      toast.error("Greška prilikom uploada slike");
      return;
    }

    const request: CreateExponatDto = {
      alternateName: formData.alternateName,
      description: formData.description,
      funFacts: formData.funFacts,
      name: formData.name,
      authorId: organisationId,
      ExponatKind: formData.exponatKind,
      mainImage: image,
      attributes: JSON.stringify(formData.attributes) as any,
      categorizationId: speciesId,
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
      <Input
        form={form}
        attribute="name"
        question="Ime"
        error={form.formState.errors.name?.message?.toString()}
      />
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
      />
      <p className={classes.error}>
        {form.formState.errors.alternateName?.message?.toString() || ""}
      </p>
      <Textarea
        form={form}
        attribute="description"
        question="Description"
        error={form.formState.errors.description?.message?.toString()}
      />
      <ListInput
        form={form}
        attribute="funFacts"
        question="Fun Facts"
        error={form.formState.errors.funFacts?.message?.toString()}
      />
      <FileUpload
        name={"Glavna slika eksponata"}
        onChange={setExponatMainImage}
      />
      <AttributeInput
        form={form}
        attribute="attributes"
        question="Attributes"
        error={form.formState.errors.attributes?.message?.toString()}
      />

      <SelectInput
        form={form}
        name="exponatKind"
        label="Vrsta exponata"
        options={[
          { value: "EUCARIOT", label: "Eukariot" },
          { value: "PROCARIOT", label: "Procariot" },
          { value: "MINERAL", label: "Mineral" },
        ]}
        error={form.formState.errors.exponatKind?.message?.toString()}
      />
      <BaseButton text="Pošalji" />
    </form>
  );
};
