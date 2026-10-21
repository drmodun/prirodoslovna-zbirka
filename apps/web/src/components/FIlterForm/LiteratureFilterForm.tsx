"use client";
import Link from "next/link";
import classes from "./FilterForm.module.scss";
import { z } from "zod";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "components/Input";
import SelectInput from "components/SelectInput";
import BaseButton from "components/BaseButton";
import ListInput from "components/ListInput";
import {
  getLiteratureTypesList,
  getTopicsList,
  getTopicsValues,
} from "@/utility/static/getEnumLists";
import { useTranslations } from "next-intl";

interface Props {
  searchParams?: any;
}

export const LiteratureFilter = ({ searchParams }: Props) => {
  const t = useTranslations("Filters");
  const tTopics = useTranslations("Enums.Topics");
  const tWorkTypes = useTranslations("Enums.WorkType");
  const schema = z.object({
    q: z.optional(z.string()),
    publisher: z.optional(z.array(z.string())),
    source: z.optional(z.array(z.string())),
    topics: z.optional(
      z.enum(["", ...getTopicsValues()], {
        invalid_type_error: t("literature.invalidTopic", {
          topics: getTopicsValues().join(", "),
        }),
      }),
    ),
    year: z.optional(z.array(z.number())),
    literatureType: z.optional(z.enum(["", ...getLiteratureTypesList()])),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      q: searchParams?.q || "",
      publisher: searchParams?.publisher || [],
      source: searchParams?.source || [],
      topics: searchParams?.topics || "",
      year: searchParams?.year || [],
      literatureType: searchParams?.literatureType || "",
    } as FieldValues,
  });

  const handleFilter = (data: any) => {};

  return (
    <div className={classes.container}>
      <form
        onSubmit={form.handleSubmit(handleFilter)}
        className={classes.filter}
      >
        <h2>{t("literature.title")}</h2>
        <Input form={form} attribute="q" question={t("name")} />
        <SelectInput
          name="topics"
          label={t("literature.topic")}
          form={form}
          options={[
            { label: t("literature.topic"), value: "" },
            ...getTopicsList().map((type) => ({
              label: tTopics(type),
              value: type,
            })),
          ]}
        />
        <ListInput
          form={form}
          attribute="publisher"
          question={t("literature.publisher")}
          initValue={searchParams.publisher}
        />
        <ListInput
          form={form}
          attribute="source"
          question={t("literature.source")}
          initValue={searchParams.source}
        />
        <ListInput
          form={form}
          attribute="year"
          question={t("literature.year")}
          initValue={searchParams.year}
        />
        <SelectInput
          name="literatureType"
          label={t("literature.type")}
          form={form}
          options={[
            { label: t("literature.type"), value: "" },
            ...getLiteratureTypesList().map((type) => ({
              label: tWorkTypes(type),
              value: type,
            })),
          ]}
        />
      </form>
      <Link
        className={classes.button}
        href={{
          pathname: "/search",
          query: {
            kind: "literature",
            ...(form.watch("q") && {
              q: form.watch("q"),
            }),
            ...(form.watch("topics") && {
              topics: form.watch("topics"),
            }),
            ...(form.watch("publisher") && {
              publisher: form.watch("publisher"),
            }),
            ...(form.watch("source") && {
              source: form.watch("source"),
            }),
            ...(form.watch("year") && {
              year: form.watch("year"),
            }),
            ...(form.watch("literatureType") && {
              literatureType: form.watch("literatureType"),
            }),
          },
        }}
      >
        <BaseButton text={t("search")} />
      </Link>
    </div>
  );
};
