"use client";
import { ExponatExtendedResponse, SpeciesResponse } from "@biosfera/types";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "components/Input";
import { FieldValues, UseFormReturn, useForm } from "react-hook-form";
import classes from "./ExponatForm.module.scss";
import Textarea from "components/Textarea";
import ListInput from "components/ListInput";
import AttributeInput from "components/AttributeInput";
import SelectInput from "components/SelectInput";
import BaseButton from "components/BaseButton";
import Dropdown from "components/Dropdown";
import { useGetSpecies } from "@/api/useGetSpecies";
import { useState } from "react";
import FileUpload from "components/FileUpload";
import AuthorshipButton from "components/AuthorshipButton";
import { AuthorshipInfoFields } from "components/AuthorshipInfoModal/AuthorshipInfoModal";
import {
  createExponatSchema,
  getExponatKindOptions,
  isMineral,
} from "./exponatSchema";
import { useTranslations } from "next-intl";
import { useExponatSubmit } from "./useExponatSubmit";

export interface ExponatModalSectionsProps {
  organisationId: string;
  isEdit?: boolean;
  values?: ExponatExtendedResponse;
}

const LARGE_FILE_MAX_SIZE = 100000000;

//Check for valid species with two word nomenclature
const toSpeciesOptions = (species?: SpeciesResponse[]) =>
  species
    ?.filter((x) => x.rank === "SPECIES" && x.species?.split(" ").length > 1)
    .map((x) => ({ value: x.species, label: x.species })) || [];

const getDefaultValues = (values?: ExponatExtendedResponse) =>
  ({
    ...values,
    name: values?.title,
    description: values?.description,
    funFacts: values?.funFacts,
    alternateName: values?.alternateName,
    exponatKind: values?.exponatKind,
    attributes: JSON.parse(values?.attributes as any),
  }) as FieldValues;

interface NomenclatureFieldProps {
  form: UseFormReturn<FieldValues>;
  species?: SpeciesResponse[];
  initSelected?: string;
  onSelect: (species: string) => void;
}

const NomenclatureField = ({
  form,
  species,
  initSelected,
  onSelect,
}: NomenclatureFieldProps) => {
  const t = useTranslations("ExponatForm");

  return isMineral(form.watch("exponatKind")) ? (
    <Input
      form={form}
      attribute="alternateName"
      question={t("nomenclature")}
      error={form.formState.errors.alternateName?.message?.toString()}
    />
  ) : (
    <Dropdown
      form={form}
      attribute="alternateName"
      initPlaceholder={t("species")}
      options={toSpeciesOptions(species)}
      initSelected={initSelected}
      onSelect={onSelect}
    />
  );
};

export const ExponatForm = ({
  organisationId,
  isEdit,
  values,
}: ExponatModalSectionsProps) => {
  const t = useTranslations("ExponatForm");
  const tKinds = useTranslations("ExponatKinds");
  const [selectedSpecies, setSelectedSpecies] = useState<string>(
    values?.alternateName || "",
  );
  const [mainImage, setMainImage] = useState<File[]>([]);
  const [thirdDimensionalModel, setThirdDimensionalModel] = useState<File[]>(
    [],
  );
  const [video, setVideo] = useState<File[]>([]);

  const form = useForm({
    resolver: zodResolver(createExponatSchema(t)),
    ...(isEdit && { defaultValues: getDefaultValues(values) }),
  });
  const { errors } = form.formState;

  const { data: species } = useGetSpecies(selectedSpecies);
  const submit = useExponatSubmit({ organisationId, isEdit, values, species });

  const onSubmit = (formData: any) =>
    submit(formData, { mainImage, thirdDimensionalModel, video });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={classes.form}>
      <Input
        form={form}
        attribute="name"
        question={t("name")}
        error={errors.name?.message?.toString()}
      />
      <SelectInput
        form={form}
        name="exponatKind"
        label={t("kind")}
        options={getExponatKindOptions(tKinds)}
        error={errors.exponatKind?.message?.toString()}
      />
      <NomenclatureField
        form={form}
        species={species}
        initSelected={values?.alternateName}
        onSelect={setSelectedSpecies}
      />
      <p className={classes.error}>
        {errors.alternateName?.message?.toString() || ""}
      </p>
      <Textarea
        form={form}
        attribute="description"
        question={t("description")}
        error={errors.description?.message?.toString()}
      />
      <ListInput
        form={form}
        attribute="funFacts"
        question={t("funFacts")}
        initValue={values?.funFacts}
        error={errors.funFacts?.message?.toString()}
      />
      <FileUpload name={t("mainImage")} onChange={setMainImage} />
      <FileUpload
        name={t("model")}
        onChange={setThirdDimensionalModel}
        maxFiles={1}
        fullMaxSize={LARGE_FILE_MAX_SIZE}
      />
      <FileUpload
        name={t("video")}
        onChange={setVideo}
        maxFiles={1}
        fullMaxSize={LARGE_FILE_MAX_SIZE}
      />
      <AuthorshipButton
        form={form}
        type={AuthorshipInfoFields.EXPONAT}
        currentValues={values?.authorshipInfo}
      />
      <p className={classes.error}>
        {errors.authorshipInfoId?.message?.toString() || ""}
      </p>
      <AttributeInput
        form={form}
        attribute="attributes"
        question={t("attributes")}
        initValue={
          values?.attributes ? JSON.parse(values?.attributes as any) : {}
        }
        error={errors.attributes?.message?.toString()}
      />

      <BaseButton text={t("submit")} />
    </form>
  );
};
