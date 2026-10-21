"use client";
import Link from "next/link";
import classes from "./FilterForm.module.scss";
import { z } from "zod";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "components/Input";
import SelectInput from "components/SelectInput";
import BaseButton from "components/BaseButton";
import { useTranslations } from "next-intl";

interface Props {
  searchParams?: any;
}

export const PostFilter = ({ searchParams }: Props) => {
  const t = useTranslations("Filters");
  const schema = z
    .object({
      title: z.optional(z.string()),
      userName: z.optional(z.string()),
      postName: z.optional(z.string()),
      attribute: z.optional(
        z.enum(["title", "createdAt", "postAmount", "favourites"]),
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
    }, t("sortPair"));

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: searchParams?.title || searchParams?.name || "",
      userName: searchParams?.search || "",
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
        <h2>{t("post.title")}</h2>
        <Input form={form} attribute="title" question={t("name")} />
        <Input
          form={form}
          attribute="userName"
          question={t("post.author")}
          error={form.formState.errors.userName?.message?.toString()}
        />
        <Input
          form={form}
          attribute="exponatName"
          question={t("post.exponatName")}
        />
        <SelectInput
          name="attribute"
          label={t("sortBy")}
          form={form}
          options={[
            { label: t("relevance"), value: "Relevantnost" },
            { label: t("title"), value: "title" },
            { label: t("post.createdAt"), value: "createdAt" },
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
            kind: "post",
            ...(form.watch("title") && {
              title: form.watch("title"),
            }),
            ...(form.watch("userName") && {
              userName: form.watch("userName"),
            }),
            ...(form.watch("exponatName") && {
              exponatName: form.watch("exponatName"),
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
