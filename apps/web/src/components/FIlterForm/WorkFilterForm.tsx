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
import { useTranslations } from "next-intl";

interface Props {
  searchParams?: any;
}

export const WorkFilter = ({ searchParams }: Props) => {
  const t = useTranslations("Filters");
  const schema = z
    .object({
      title: z.optional(z.string()),
      tags: z.optional(z.string()),
      direction: z.optional(z.enum(["asc", "desc"])),
      attribute: z.optional(z.enum(["title", "createdAt", "saves"])),
    })
    .refine((data) => {
      if (data.direction && !data.attribute) {
        return false;
      }
      if (data.attribute && !data.direction) {
        return false;
      }
    }, t("sortPair"));

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: searchParams?.title || searchParams?.name || "",
      tags: searchParams?.tags || "",
      attribute: searchParams?.attribute || "Relevantnost",
      direction: searchParams?.direction || "desc",
    } as FieldValues,
  });

  const handleFilter = (data: any) => {};

  return (
    <div className={classes.container}>
      <form
        onSubmit={form.handleSubmit(handleFilter)}
        className={classes.filter}
      >
        <h2>{t("work.title")}</h2>
        <Input form={form} attribute="title" question={t("name")} />
        <ListInput form={form} attribute="tags" question={t("work.tags")} />
        <SelectInput
          name="attribute"
          label={t("sortBy")}
          form={form}
          options={[
            { label: t("relevance"), value: "Relevantnost" },
            { label: t("title"), value: "title" },
            { label: t("work.createdAt"), value: "createdAt" },
            { label: t("work.saves"), value: "saves" },
          ]}
          error={form.formState.errors.attribute?.message?.toString()}
        />
        <SelectInput
          name="direction"
          label={t("direction")}
          form={form}
          options={[
            { label: t("ascending"), value: "asc" },
            { label: t("descending"), value: "desc" },
          ]}
          error={form.formState.errors.direction?.message?.toString()}
        />
      </form>
      <Link
        className={classes.button}
        href={{
          pathname: "/search",
          query: {
            kind: "work",
            ...(form.watch("title") && {
              title: form.watch("title"),
            }),
            ...(form.watch("tags") && {
              tags: form.watch("tags"),
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
        <BaseButton text={t("search")} />
      </Link>
    </div>
  );
};
