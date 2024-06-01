"use client";
import {
  Directories,
  ExponatExtendedResponse,
  SpeciesResponse,
} from "@biosfera/types";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "components/Input";
import { FieldValues, useForm } from "react-hook-form";
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
import { useUpdateExponat } from "@/api/useUpdateExponat";
import AuthorshipInfoModal from "components/AuthorshipInfoModal";
import AuthorshipButton from "components/AuthorshipButton";
import { AuthorshipInfoFields } from "components/AuthorshipInfoModal/AuthorshipInfoModal";
export interface ExponatModalSectionsProps {
  organisationId: string;
  isEdit?: boolean;
  values?: ExponatExtendedResponse;
}

export const ExponatForm = ({
  organisationId,
  isEdit,
  values,
}: ExponatModalSectionsProps) => {
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
      authorshipInfoId: z.string().uuid(),
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
  const [selectedSpecies, setSelectedSpecies] = useState<string>(
    values?.alternateName || ""
  );
  const [exponatMainImage, setExponatMainImage] = useState<File[]>(
    [] as File[]
  );

  const form = useForm({
    resolver: zodResolver(schema),
    ...(isEdit && {
      defaultValues: {
        ...values,
        name: values?.title,
        description: values?.description,
        funFacts: values?.funFacts,
        alternateName: values?.alternateName,
        exponatKind: values?.exponatKind,
        attributes: JSON.parse(values?.attributes as any),
      } as FieldValues,
    }),
  });

  const { data, error, isLoading } = useGetSpecies(selectedSpecies);
  const { mutateAsync } = useReadOrCreateCategorization();
  const { mutateAsync: createExponat } = useCreateExponat();
  const { mutateAsync: uploadImage } = useUploadFile();
  const { mutateAsync: updateExponat } = useUpdateExponat();

  const onSubmit = async (formData: any) => {
    if (exponatMainImage.length === 0 && !isEdit) {
      toast.error("Mora postojati glavna slika eksponata");
      return;
    }

    const species =
      formData.exponatKind?.toLowerCase() === "mineral" ||
      data?.find((x: SpeciesResponse) => x.species === formData.alternateName);

    if (!species && !isEdit) {
      alert("Nomenklatura nije validna");
      return;
    }

    if (formData.exponatKind?.toLowerCase() !== "mineral")
      species.domain = formData.exponatKind;

    const speciesId =
      formData.exponatKind?.toLowerCase() !== "mineral" &&
      (await mutateAsync(species));

    if (!speciesId && formData.exponatKind?.toLowerCase() !== "mineral") {
      toast.error("Greška prilikom kreiranja kategorizacije");
      return;
    }

    const image =
      exponatMainImage[0] &&
      (await uploadImage({
        file: exponatMainImage[0],
        directory: Directories.EXPONAT,
      }));

    if (!image && !isEdit) {
      toast.error("Greška prilikom uploada slike");
      return;
    }

    const request: CreateExponatDto = {
      alternateName: formData.alternateName,
      description: formData.description,
      funFacts: formData.funFacts,
      name: formData.name,
      authorshipInfoId: formData.authorshipInfoId,
      authorId: organisationId,
      ExponatKind: formData.exponatKind,
      mainImage: image,
      attributes: JSON.stringify(formData.attributes) as any,
      categorizationId: speciesId || undefined,
    };

    const params = {
      organisationId,
      exponat: request,
    };

    const action = isEdit
      ? await updateExponat({
          exponatId: values?.id as string,
          updateExponatDto: request,
        })
      : await createExponat(params);
    if (action) {
      setTimeout(() => {
        window.location.href = `/organisation/${organisationId}`;
      }, 2000);
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
      {form.watch("exponatKind")?.toLowerCase() !== "mineral" ? (
        <Dropdown
          form={form}
          attribute="alternateName"
          initPlaceholder="Znanstvena vrsta eksponata"
          options={
            data
              ?.filter(
                (x: SpeciesResponse) =>
                  x.rank === "SPECIES" && x.species?.split(" ").length > 1
              ) //Check for valid species with two word nomenclature
              .map((species: SpeciesResponse) => ({
                value: species.species,
                label: species.species,
              })) || []
          }
          initSelected={values?.alternateName}
          onSelect={setSelectedSpecies}
        />
      ) : (
        <Input
          form={form}
          attribute="alternateName"
          question="Nomenklatura"
          error={form.formState.errors.alternateName?.message?.toString()}
        />
      )}
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
        initValue={values?.funFacts}
        error={form.formState.errors.funFacts?.message?.toString()}
      />
      <FileUpload
        name={"Glavna slika eksponata"}
        onChange={setExponatMainImage}
      />
      <AuthorshipButton
        form={form}
        type={AuthorshipInfoFields.EXPONAT}
        currentValues={values?.authorshipInfo}
      />
      <AttributeInput
        form={form}
        attribute="attributes"
        question="Attributes"
        initValue={
          values?.attributes ? JSON.parse(values?.attributes as any) : {}
        }
        error={form.formState.errors.attributes?.message?.toString()}
      />

      <BaseButton text="Pošalji" />
    </form>
  );
};
